import sys
import os

# Add the project root to python path to resolve from backend.... imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database.database import SessionLocal, engine, Base
from backend.models import User, Agent
from backend.core.security import get_password_hash

def seed():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check and create default analyst
        analyst = db.query(User).filter(User.username == "analyst").first()
        if not analyst:
            print("Creating default analyst user (username: analyst, password: password123)...")
            analyst = User(
                username="analyst",
                hashed_password=get_password_hash("password123"),
                role="analyst"
            )
            db.add(analyst)
        else:
            print("Analyst user already exists. Re-updating password hash to password123...")
            analyst.hashed_password = get_password_hash("password123")
            
        # Check and create sample agent
        agent = db.query(Agent).filter(Agent.hostname == "cni-endpoint-01").first()
        if not agent:
            print("Creating sample agent (cni-endpoint-01)...")
            agent = Agent(
                hostname="cni-endpoint-01",
                ip_address="192.168.1.105",
                os_type="linux",
                status="online"
            )
            db.add(agent)
        else:
            print("Sample agent already exists.")
            
        db.commit()
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
