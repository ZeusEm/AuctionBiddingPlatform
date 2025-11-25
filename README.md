# Auction Management & Bidding Platform  
*A QR‑powered, scalable, mobile‑first auction system for exhibitions, events, and enterprises.*

---

## 🌟 Introduction

This platform is a **full‑stack auction management solution** designed for events, art exhibitions, charity fundraisers, and enterprise‑grade silent auctions.

It enables participants to join instantly by scanning a **QR code**, and empowers organizers with admin tools, analytics, and seamless event control.

> **Real‑world deployment:**  
> Successfully used during an art auction event at *Naval Dockyard (Mumbai)*, proving its reliability and event readiness.

<p align="center">
  <img src="https://github.com/user-attachments/assets/fd1f5917-eefc-44c5-ae0c-e9cad82cf102" width="250" style="vertical-align: middle;"/>
  <img src="https://github.com/user-attachments/assets/78a92621-3195-413f-9608-05c6e35c1a54" width="250" style="vertical-align: middle;"/>
  <img src="https://github.com/user-attachments/assets/0cd0ca7f-4f23-4184-99ff-0bff856864ba" width="250" style="vertical-align: middle;"/>
</p>

---

# 🎯 Value Proposition

## 💼 For Event Organizers / SaaS Customers
- Run auctions with **zero friction onboarding**
- Replace manual bidding sheets with **QR-powered digital bidding**
- Collect bids securely and track activity in real time
- Generate **Excel reports** for winners and analytics
- Host multiple events, exhibitions, or shows
- Fully mobile-ready — ideal for walk‑in audiences

## 🧑‍💻 For Developers & Tech Stakeholders
- Modular React frontend with Context API
- Clean Node.js/Express REST API
- PostgreSQL relational database schema optimized for auctions
- Structured routes, middlewares, and controllers
- Easy to scale, containerize, and deploy
- Suitable foundation for a multi-tenant SaaS

---

# 🧩 Core Features

### ✔️ User Features
- QR code scan → instant item access  
- Mobile number login (OTP-style pattern)  
- Place bids with incremental validation  
- Track personal bid history  
- View if they are currently the highest bidder  

### ✔️ Admin Features
- Add/manage auction items with images  
- Generate QR codes for each item  
- View real‑time bid activity  
- Export bid results to Excel  
- Adjust starting prices & bid increments  
- Enable/disable items during the event  

---

# 🏗️ System Architecture

## 📐 High-Level Architecture Diagram (ASCII)

                            +-----------------------+                        
                            |      Admin Panel      |
                            |  React (web/mobile)   |
                            +-----------+-----------+
                                        |
                                        v
    +----------------+        +-------------+-------------+        +-------------------+
    |   User Device  | -----> |   Backend API (Express)   | -----> |   PostgreSQL DB   |
    | (Scan QR, Bid) |        |  Auth, Items, Bids, Admin |        | Users, Items,     |
    +----------------+        +-------------+-------------+        | Bids, Analytics   |
                                        |                          +-------------------+
                                        v
                             +-------------------------+
                             |     QR Code Engine      |
                             |   (Per-item QR links)   |
                             +-------------------------+
                             
# 🧠 Technical Stack

### 🖥️ Frontend
- React 18
- React Router
- Context API for authentication
- Axios for API communication
- TailwindCSS / CSS modules

# 🧮 Backend

### Node.js / Express
- JWT authentication
- PostgreSQL + node-postgres
- QR code generation
- XLSX export
- BCrypt hashing

# 🚀 SaaS-Ready Capabilities
This project is engineered with future SaaS enablement in mind:
- Event-based multi-tenancy
- Customer onboarding workflow
- Theme customization per event
- Role-based access & user segmentation
- Cloud storage for item images
- API-based pricing rules
- Multi-event dashboards
- Subdomain isolation (e.g., eventname.yourdomain.com)

# 🤝 Acknowledgment
This platform was successfully used during a real-world auction event at Naval Dockyard Mumbai, demonstrating its reliability and practical utility in a live environment.

# 📜 License
Licensed under the GNU General Public License (GPL).

# 📬 Contact Us
If you’d like to collaborate, request a demo, or explore how this platform can power your next auction event, feel free to reach out to [Shubham Mehta](https://www.linkedin.com/in/shubham-mehta-5141172b3/)
