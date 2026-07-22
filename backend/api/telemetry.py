import uuid
import socket
import platform
import time
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.core.security import get_current_user
from backend.schemas.telemetry_schema import TelemetryCreate, TelemetryResponse
from backend.services import telemetry_service
from backend.models.user import User

router = APIRouter()

@router.post("/", response_model=TelemetryResponse, status_code=status.HTTP_201_CREATED)
def submit_telemetry(telemetry_in: TelemetryCreate, db: Session = Depends(get_db)):
    return telemetry_service.create_telemetry(db, telemetry_in)

@router.get("/", response_model=List[TelemetryResponse])
def get_all_telemetry(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return telemetry_service.list_telemetry(db, skip=skip, limit=limit)

@router.get("/agent/{agent_id}", response_model=List[TelemetryResponse])
def get_agent_telemetry(
    agent_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return telemetry_service.get_telemetry_by_agent(db, agent_id=agent_id, skip=skip, limit=limit)


@router.get("/system")
def get_system_telemetry(current_user: User = Depends(get_current_user)):
    """
    Returns real-time host system telemetry using psutil.
    This feeds the Live Mode widget in the dashboard.
    """
    try:
        import psutil
        
        cpu_pct = psutil.cpu_percent(interval=0.3)
        
        mem = psutil.virtual_memory()
        ram_pct = mem.percent
        ram_used_gb = round(mem.used / (1024 ** 3), 2)
        ram_total_gb = round(mem.total / (1024 ** 3), 2)
        
        disk = psutil.disk_usage("/")
        disk_pct = disk.percent
        disk_used_gb = round(disk.used / (1024 ** 3), 2)
        disk_total_gb = round(disk.total / (1024 ** 3), 2)
        
        net = psutil.net_io_counters()
        net_sent_mb = round(net.bytes_sent / (1024 ** 2), 2)
        net_recv_mb = round(net.bytes_recv / (1024 ** 2), 2)
        
        boot_time = psutil.boot_time()
        uptime_seconds = int(time.time() - boot_time)
        
        try:
            hostname = socket.gethostname()
            ip_address = socket.gethostbyname(hostname)
        except Exception:
            hostname = platform.node()
            ip_address = "127.0.0.1"
        
        os_info = f"{platform.system()} {platform.release()}"
        
        return {
            "cpu_percent": cpu_pct,
            "ram_percent": ram_pct,
            "ram_used_gb": ram_used_gb,
            "ram_total_gb": ram_total_gb,
            "disk_percent": disk_pct,
            "disk_used_gb": disk_used_gb,
            "disk_total_gb": disk_total_gb,
            "net_sent_mb": net_sent_mb,
            "net_recv_mb": net_recv_mb,
            "uptime_seconds": uptime_seconds,
            "hostname": hostname,
            "ip_address": ip_address,
            "os": os_info,
            "platform": platform.machine(),
            "source": "live_endpoint_telemetry",
            "note": "This is real telemetry from the ARGUS server host, not simulated data."
        }
    except ImportError:
        # psutil not available — return degraded response
        return {
            "cpu_percent": 0,
            "ram_percent": 0,
            "ram_used_gb": 0,
            "ram_total_gb": 0,
            "disk_percent": 0,
            "disk_used_gb": 0,
            "disk_total_gb": 0,
            "net_sent_mb": 0,
            "net_recv_mb": 0,
            "uptime_seconds": 0,
            "hostname": platform.node(),
            "ip_address": "127.0.0.1",
            "os": platform.system(),
            "platform": platform.machine(),
            "source": "fallback",
            "note": "psutil not installed. Install psutil to enable live telemetry."
        }
    except Exception as e:
        return {
            "cpu_percent": 0,
            "ram_percent": 0,
            "ram_used_gb": 0,
            "ram_total_gb": 0,
            "disk_percent": 0,
            "disk_used_gb": 0,
            "disk_total_gb": 0,
            "net_sent_mb": 0,
            "net_recv_mb": 0,
            "uptime_seconds": 0,
            "hostname": "unknown",
            "ip_address": "127.0.0.1",
            "os": platform.system(),
            "platform": platform.machine(),
            "source": "error",
            "note": f"Error collecting telemetry: {str(e)}"
        }
