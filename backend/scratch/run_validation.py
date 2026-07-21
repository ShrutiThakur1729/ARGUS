import requests
import sys

BASE_URL = "http://127.0.0.1:8001"

def run_tests():
    report = []

    # 1. Health check & SQLite check
    print("1. Running Health Check...")
    try:
        r = requests.get(f"{BASE_URL}/health/")
        res_json = r.json()
        status_code = r.status_code
        db_status = res_json.get("database")
        passed = (status_code == 200 and db_status == "ok")
        report.append({
            "test": "System Health Check (Verify DB is connected)",
            "result": f"Status: {res_json.get('status')}, Database: {db_status}",
            "code": status_code,
            "status": "PASS" if passed else "FAIL"
        })
    except Exception as e:
        report.append({
            "test": "System Health Check (Verify DB is connected)",
            "result": f"Connection Error: {str(e)}",
            "code": 0,
            "status": "FAIL"
        })

    # 2. JWT Authentication
    print("2. Testing JWT Login...")
    token = None
    try:
        login_data = {"username": "analyst", "password": "password123"}
        r = requests.post(f"{BASE_URL}/api/v1/auth/login", data=login_data)
        status_code = r.status_code
        res_json = r.json()
        token = res_json.get("access_token")
        passed = (status_code == 200 and token is not None)
        report.append({
            "test": "JWT Authentication Login",
            "result": "Access token returned successfully" if passed else f"Login failed: {res_json}",
            "code": status_code,
            "status": "PASS" if passed else "FAIL"
        })
    except Exception as e:
        report.append({
            "test": "JWT Authentication Login",
            "result": f"Connection Error: {str(e)}",
            "code": 0,
            "status": "FAIL"
        })

    if not token:
        print("Cannot continue testing without auth token.")
        print_report(report)
        sys.exit(1)

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Agent CRUD
    # CREATE (Enroll)
    print("3. Testing Agent CRUD - Create...")
    agent_id = None
    try:
        agent_data = {
            "hostname": "test-validation-agent",
            "ip_address": "10.0.0.45",
            "os_type": "windows"
        }
        r = requests.post(f"{BASE_URL}/api/v1/agents/enroll", json=agent_data, headers=headers)
        status_code = r.status_code
        res_json = r.json()
        agent_id = res_json.get("id")
        passed = (status_code == 201 and agent_id is not None)
        report.append({
            "test": "Agent CRUD - Create (Enroll)",
            "result": f"Agent Enrolled (ID: {agent_id})",
            "code": status_code,
            "status": "PASS" if passed else "FAIL"
        })
    except Exception as e:
        report.append({
            "test": "Agent CRUD - Create (Enroll)",
            "result": f"Error: {str(e)}",
            "code": 0,
            "status": "FAIL"
        })

    if agent_id:
        # READ
        print("4. Testing Agent CRUD - Read (List)...")
        try:
            r = requests.get(f"{BASE_URL}/api/v1/agents/", headers=headers)
            status_code = r.status_code
            res_json = r.json()
            found = any(a.get("id") == agent_id for a in res_json)
            report.append({
                "test": "Agent CRUD - Read (List)",
                "result": "Agent found in agent list" if found else "Agent not found in list",
                "code": status_code,
                "status": "PASS" if (status_code == 200 and found) else "FAIL"
            })
        except Exception as e:
            report.append({
                "test": "Agent CRUD - Read (List)",
                "result": f"Error: {str(e)}",
                "code": 0,
                "status": "FAIL"
            })

        print("5. Testing Agent CRUD - Read (Get by ID)...")
        try:
            r = requests.get(f"{BASE_URL}/api/v1/agents/{agent_id}", headers=headers)
            status_code = r.status_code
            res_json = r.json()
            passed = (status_code == 200 and res_json.get("hostname") == "test-validation-agent")
            report.append({
                "test": "Agent CRUD - Read (Get by ID)",
                "result": f"Fetched agent details: {res_json.get('hostname')}",
                "code": status_code,
                "status": "PASS" if passed else "FAIL"
            })
        except Exception as e:
            report.append({
                "test": "Agent CRUD - Read (Get by ID)",
                "result": f"Error: {str(e)}",
                "code": 0,
                "status": "FAIL"
            })

        # UPDATE (Heartbeat)
        print("6. Testing Agent CRUD - Update (Heartbeat)...")
        try:
            r = requests.post(f"{BASE_URL}/api/v1/agents/{agent_id}/heartbeat", json={"status": "online"}, headers=headers)
            status_code = r.status_code
            res_json = r.json()
            passed = (status_code == 200 and res_json.get("status") == "online")
            report.append({
                "test": "Agent CRUD - Update (Heartbeat)",
                "result": f"Status updated to: {res_json.get('status')}",
                "code": status_code,
                "status": "PASS" if passed else "FAIL"
            })
        except Exception as e:
            report.append({
                "test": "Agent CRUD - Update (Heartbeat)",
                "result": f"Error: {str(e)}",
                "code": 0,
                "status": "FAIL"
            })

        # DELETE
        print("7. Testing Agent CRUD - Delete...")
        try:
            r = requests.delete(f"{BASE_URL}/api/v1/agents/{agent_id}", headers=headers)
            status_code = r.status_code
            passed = (status_code == 204)
            
            # Verify it's gone
            r_verify = requests.get(f"{BASE_URL}/api/v1/agents/{agent_id}", headers=headers)
            deleted = (r_verify.status_code == 404)
            
            report.append({
                "test": "Agent CRUD - Delete & Verify",
                "result": "Agent deleted and verified missing (404)",
                "code": status_code,
                "status": "PASS" if (passed and deleted) else "FAIL"
            })
        except Exception as e:
            report.append({
                "test": "Agent CRUD - Delete & Verify",
                "result": f"Error: {str(e)}",
                "code": 0,
                "status": "FAIL"
            })

    # 4. Trigger Telegram alert dispatcher
    print("8. Triggering Alert Notification...")
    try:
        alert_payload = {
            "title": "CNI Critical System Intrusion",
            "description": "Suspicious login attempt on core CNI endpoint.",
            "severity": "critical",
            "mitre_tactic": "Initial Access",
            "mitre_technique_id": "T1190",
            "mitre_technique": "Exploit Public-Facing Application"
        }
        r = requests.post(f"{BASE_URL}/api/v1/dispatcher/dispatch", json=alert_payload, headers=headers)
        status_code = r.status_code
        res_json = r.json()
        report.append({
            "test": "Telegram Notification Dispatch",
            "result": f"Dispatch endpoint response: {res_json}",
            "code": status_code,
            "status": "PASS" if (status_code == 200) else "FAIL"
        })
    except Exception as e:
        report.append({
            "test": "Telegram Notification Dispatch",
            "result": f"Error: {str(e)}",
            "code": 0,
            "status": "FAIL"
        })

    print_report(report)

def print_report(report):
    print("\n" + "="*80)
    print("ARGUS BACKEND VALIDATION REPORT")
    print("="*80)
    print(f"{'Test Performed':<40} | {'Status Code':<11} | {'Status':<6} | {'Result'}")
    print("-"*80)
    for r in report:
        print(f"{r['test']:<40} | {r['code']:<11} | {r['status']:<6} | {r['result']}")
    print("="*80)

if __name__ == "__main__":
    run_tests()
