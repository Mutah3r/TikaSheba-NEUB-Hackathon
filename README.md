## 💉 Project - TikaSheba

> **TikaSheba** is an integrated, secure, and data-driven platform designed to **digitally transform and streamline the end-to-end national vaccination workflow**. It resolves critical issues like fragmented workflows, manual logging, and poor forecasting by offering role-based access to citizens, vaccination centers, staff, and health authorities. By leveraging a modern MERN stack architecture and integrating **advanced AI/ML automation** (including Meta Prophet and Gemini API), TikaSheba ensures real-time visibility, optimized stock management, and proactive demand forecasting to achieve maximum vaccination coverage and operational efficiency.

---

## Problem Addressed 🛑

TikaSheba targets the following critical inefficiencies in traditional vaccination management:

- **Fragmented Workflows:** Disjointed processes across citizens, centers, and authorities leading to missed appointments, poor coordination, and user frustration.
- **Operational Inefficiencies:** Reliance on manual coordination and paper-based logs hindering real-time tracking of vaccine usage, staff activity, and stock levels.
- **Mismatched Capacity and Demand:** Limited or non-existent forecasting capability causing critical mismatches between center capacity, available stock, and citizen appointment demand.

---

## Team Members 👥

**\# TEAM ONTORPONTHIK**.

- **Arfatul Islam Asif** [](mailto:awakicde@gmail.com)
- **Unayes Ahmed Khan** [](mailto:unayeskhan.0808@gmail.com)
- **Mutaher Ahmed Shakil** [](mailto:mutaher.shakil@gmail.com)

---

## Technologies Used 💻

### Frontend

- ![HTML](https://img.icons8.com/color/48/000000/html-5.png) **HTML**: To structure and organize the web interface.
- ![CSS](https://img.icons8.com/color/48/000000/css3.png) **CSS**: For styling and responsive layout.
- ![Tailwind](https://img.icons8.com/color/48/000000/tailwindcss.png) **Tailwind CSS**: For rapid UI development with a utility-first approach.
- ![JavaScript](https://img.icons8.com/color/48/000000/javascript.png) **JavaScript**: To add interactivity and dynamic elements.
- ![React](https://img.icons8.com/color/48/000000/react-native.png) **React.js**: For building modular, component-based web dashboards.
- ![Vite] **Vite**: A fast build tool for optimized frontend bundling.
- ![React Router](https://i.ibb.co/19d5sDG/react-router-svg.png) **React Router**: For managing role-based routes and navigation.
- ![Recharts](https://i.ibb.co/KmJfYmC/image-2.png) **Recharts**: For creating analytics and performance charts.
- ![React Native](https://img.icons8.com/color/48/000000/react-native.png) **React Native**: For developing the citizen and staff mobile applications.
- ![SweetAlert2](https://i.ibb.co/mbm8r3X/image-4.png) **SweetAlert2**: For alert popups, confirmations, and success messages.
- ![Axios](https://i.ibb.co/PwYcWwj/image-5.png) **Axios**: For API requests and backend communication.

### Backend

- ![Node.js](https://img.icons8.com/color/48/000000/nodejs.png) **Node.js**: The runtime environment powering the backend logic.
- ![Express.js](https://cdn.icon-icons.com/icons2/2699/PNG/48/expressjs_logo_icon_169185.png) **Express.js**: To design RESTful APIs and manage service routes.
- ![Swagger] **Swagger**: For API documentation and testing endpoints.
- ![dotenv](https://i.ibb.co/myKkQ4t/image-8.png) **dotenv**: To securely load environment variables.
- ![cors](https://i.ibb.co/44PvKWw/image.jpg) **CORS**: For handling cross-origin requests.
- ![JWT](https://img.icons8.com/?size=48&id=rHpveptSuwDz&format=png) **JWT**: For secure authentication and role-based access.
- ![nodemailer](https://i.ibb.co/KzyKbvM/image-10.png) **Nodemailer**: To send OTPs, notifications, and status emails.
- ![express-rate-limit](https://i.ibb.co/2hfbCSP/image-9.png) **Express Rate Limit**: For request throttling and API protection.

### Database

- ![MongoDB](https://img.icons8.com/color/48/000000/mongodb.png) **MongoDB**: For storing user, appointment, and vaccine data.
- ![Mongoose](https://img.icons8.com/color/48/000000/mongoose.png) **Mongoose**: For schema modeling and validation in MongoDB.

### AI & ML Integration

- ![Python](https://img.icons8.com/color/48/000000/python.png) **Python**: For developing the AI automation and data analysis modules.
- ![Meta Prophet](https://i.ibb.co/Nrs3BdM/meta.png) **Meta Prophet**: To forecast vaccine demand and capacity needs.
- ![Google Gemini](https://i.ibb.co/6gwhQ4R/gemini.png) **Gemini API**: For embedding generation, LLM-powered recommendations, and intelligent responses.
- ![Pandas](https://img.icons8.com/color/48/000000/pandas.png) **Pandas**: For data preprocessing and time-series analysis.
- ![Scikit-Learn](https://img.icons8.com/color/48/000000/scikit-learn.png) **Scikit-Learn**: For machine learning models like no-show prediction and anomaly detection.

### Authentication & Security

- ![bcryptjs](https://i.ibb.co/gM8Kn7Q/image-11.png) **bcryptjs**: For password hashing and security.
- ![JWT](https://img.icons8.com/?size=48&id=rHpveptSuwDz&format=png) **JWT (JSON Web Token)**: To manage secure user sessions with role claims.
- ![Helmet](https://img.icons8.com/?size=48&id=10932&format=png) **Helmet**: For securing HTTP headers in Express applications.

### DevOps & Future Scalability

- ![GitHub](https://img.icons8.com/glyph-neue/48/000000/github.png) **GitHub**: For version control and collaborative development.

- ![Postman](https://img.icons8.com/dusk/48/000000/postman-api.png) **Postman**: For API testing and debugging.
- ![Nginx](https://img.icons8.com/color/48/000000/nginx.png) **Nginx**: For reverse proxy and load balancing setup.

## ✨ Key Features & Functional Requirements

### Core System

| Category            | Requirement                  | Description                                                                         |
| :------------------ | :--------------------------- | :---------------------------------------------------------------------------------- |
| **User Management** | Citizen Registration/Profile | Register, update profile, view vaccine history, and use QR verification.            |
| **Operations**      | Centre & Staff Management    | Login, staff assignment, stock management, capacity limits, daily usage logging.    |
| **Access**          | Authority Operations         | Create/update centres, add citizens, and oversee global statistics.                 |
| **Security**        | Secure RBAC & Auth 🔒        | Role-based access (`citizen`, `staff`, `vacc_centre`, `authority`) enforced by JWT. |

### Appointment & Logistics

1.  **Full Appointment Lifecycle** 🗓️: Comprehensive APIs for request, schedule, cancellation, and status updates, including focused views for "Today" and "Next 14 Days" scheduling.
2.  **QR-Based Verification** ✅: Rapid, secure QR verification flow to "mark done" appointments quickly at centres.
3.  **Staff Logging & Efficiency** 📝: Logs for dose usage/wastage per vaccine, feeding into staff efficiency summaries.
4.  **Notifications & OTP** ✉️: Proactive reminders and status updates via SMS/email to reduce no-shows.

---

## 🤖 AI and ML Automation Engine

A dedicated Python module (`AI_and_ML/`) leverages data-driven models for predictive automation and deep operational insight.

| Feature                | ML Tool            | Automation Goal                                                                          |
| :--------------------- | :----------------- | :--------------------------------------------------------------------------------------- |
| **Demand Forecasting** | Meta Prophet Model | Predicts appointment volumes by centre and date, informing capacity planning.            |
| **Waste Forecasting**  | Meta Prophet Model | Predicts appointment volumes by centre and date, informing capacity planning.            |
| **LLM Functions**      | Gemini API (LLM)   | Used for advanced search, summarizing complex reports, or context-aware citizen support. |

---

## 🚀 Future Improvements & Roadmap

The TikaSheba roadmap focuses on real-time capabilities, deeper integrations, and system maturity:

- **Real-time Operations** 📡: Live dashboards for queue lengths, stock levels, and staff allocation; WebSocket updates.
- **Deeper Integrations** 🔗: Integration with government registries, national SMS gateways, and health information exchanges.
- **Advanced Analytics** 🔬: Cohort-based outcomes, vaccine efficacy signals, and longitudinal reporting.
- **DevOps Maturity** 🐳: CI/CD pipelines, Infrastructure-as-Code (IaC), and robust monitoring/alerting systems.
- **Multilingual UX & Accessibility** 🌐: Localization across interfaces and WCAG-aligned design for broader reach.

---

## ✨ Key Features & Functionality

1.  **Role-Based Dashboards** 🚪: Custom interfaces optimized for **Citizen**, **Staff**, **Vaccine Centre Manager**, and **Authority** roles.
2.  **Full Appointment Lifecycle** 🗓️: Comprehensive APIs for request, schedule, cancellation, and status updates, including focused views for "Today" and "Next 14 Days" scheduling.
3.  **QR-Based Verification** ✅: Rapid, secure QR verification flow to "mark done" appointments at the center for quick status updates and history logging.
4.  **Vaccine Stock & Usage Logging** 📦: Center-level inventory management, tracking dose usage, wastage, and enabling staff efficiency reporting.
5.  **Secure Citizen Management** 👤: User registration, profile updates, and secure storage of complete vaccine history.
6.  **Real-Time Reporting** 📊: Operational dashboards providing crucial KPIs on scheduled volumes, usage summaries, and center performance.

---

## 🤖 AI and ML Automation Engine

A dedicated Python module (`AI_and_ML/`) leverages data-driven models for automation and insight.

| Feature                    | ML Tool                | Benefit                                                                                                     |
| :------------------------- | :--------------------- | :---------------------------------------------------------------------------------------------------------- |
| **Demand Forecasting**     | **Meta Prophet Model** | Predicts appointment volumes by center/date, informing capacity planning and stock requests.                |
| **Waste Forecasting**      | **Meta Prophet Model** | Predicts appointment volumes by center/date, informing capacity planning and stock requests.                |
| **Anomaly Detection**      | **ML Model**           | Flags unusual patterns in dose usage or wastage logs to improve accountability and prevent stock pilferage. |
| **Prompt/Response Engine** | **Gemini API (LLM)**   | Utilized for advanced search, help documentation generation, or summarizing complex reports.                |

---

## 🚀 Future Improvements & Roadmap

The TikaSheba roadmap focuses on real-time capabilities, deeper integrations, and system maturity:

1.  **Real-time Operations** 📡: Implement WebSocket updates for live dashboards, queue lengths, and immediate stock level changes.
2.  **Deeper Integrations** 🔗: Connect with national health registries, advanced SMS gateways, and Health Information Exchanges (HIEs).
3.  **Advanced Analytics** 🔬: Introduce cohort analysis, longitudinal reporting, and vaccine efficacy monitoring signals.
4.  **DevOps Maturity** 🐳: Establish CI/CD pipelines, Infrastructure-as-Code (IaC), and robust monitoring/alerting systems.
5.  **Enhanced UX/Accessibility** 🌐: Implement full multilingual UX localization and align design with WCAG accessibility standards.

---

# Database Schema

<img src="database.png">

# Swagger:

<img src="swagger_api_documentations.png">

# We became Champion of NEUB ICT Fest 2025!

<img src="Champion.jpeg" alt="Champion" width="50%">

<img src="During_hackathon.jpeg" alt="During Hackathon" width="50%">

## 📸 Screenshots

### Web Screenshots

<table>
  <tr>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h34m22s560.png" alt="Web Demo 1" width="300">
        <br>
        <figcaption>Landing Page</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h35m03s723.png" alt="Web Demo 2" width="300">
        <figcaption>Login Page</figcaption>
      </figure>
    </td>
  </tr>
  <tr>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h35m32s138.png" alt="Web Demo 3" width="300">
        <figcaption>Citizen Dashboard</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h35m49s044.png" alt="Web Demo 4" width="300">
        <figcaption>E-Vaccine Card</figcaption>
      </figure>
    </td>
  </tr>
  <tr>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h36m46s066.png" alt="Web Demo 5" width="300">
        <figcaption>Schedule Vaccine</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h37m00s199.png" alt="Web Demo 6" width="300">
        <figcaption>Dynamic Scheduling</figcaption>
      </figure>
    </td>
  </tr>
  <tr>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h37m10s333.png" alt="Web Demo 7" width="300">
        <figcaption>My Appointments</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h38m39s475.png" alt="Web Demo 8" width="300">
        <figcaption>AI Guidance</figcaption>
      </figure>
    </td>
  </tr>
  <tr>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h39m10s735.png" alt="Web Demo 9" width="300">
        <figcaption>Vaccine Centre Dashboard</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h39m26s327.png" alt="Web Demo 10" width="300">
        <figcaption>Vaccine Centre Dashboard</figcaption>
      </figure>
    </td>
  </tr>
  <tr>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h39m51s835.png" alt="Web Demo 11" width="300">
        <figcaption>Upcoming Appointments</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h40m10s121.png" alt="Web Demo 12" width="300">
        <figcaption>Vaccine Stock</figcaption>
      </figure>
    </td>
  </tr>
  <tr>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h40m35s962.png" alt="Web Demo 13" width="300">
        <figcaption>Vaccine Forecasting Page</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h40m57s213.png" alt="Web Demo 14" width="300">
        <figcaption>Demand Forecasting</figcaption>
      </figure>
    </td>
  </tr>
  <tr>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h41m12s808.png" alt="Web Demo 15" width="300">
        <figcaption>Staff Management</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h41m28s703.png" alt="Web Demo 16" width="300">
        <figcaption>Assign Staffs With Vaccines</figcaption>
      </figure>
    </td>
  </tr>
  <tr>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h41m40s327.png" alt="Web Demo 17" width="300">
        <figcaption>Centre Logs</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h41m58s055.png" alt="Web Demo 18" width="300">
        <figcaption>Preservation Guideline</figcaption>
      </figure>
    </td>
  </tr>
  <tr>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h42m18s366.png" alt="Web Demo 19" width="300">
        <figcaption>Authority Dashboard</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h42m30s036.png" alt="Web Demo 20" width="300">
        <figcaption>All Vaccines</figcaption>
      </figure>
    </td>
  </tr>
  <tr>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h42m41s015.png" alt="Web Demo 21" width="300">
        <figcaption>All Centres</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h43m05s545.png" alt="Web Demo 22" width="300">
        <figcaption>Stock Requests</figcaption>
      </figure>
    </td>
  </tr>
  <tr>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h43m21s820.png" alt="Web Demo 23" width="300">
        <figcaption>Coverage Map</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h43m37s335.png" alt="Web Demo 24" width="300">
        <figcaption>Vaccination Data By Age Group</figcaption>
      </figure>
    </td>
  </tr>
  <tr>
    <td>
      <figure>
        <img src="screenshots/web/vlcsnap-2025-11-14-23h44m04s556.png" alt="Web Demo 25" width="300">
        <figcaption>AI Insights</figcaption>
      </figure>
    </td>
  </tr>
</table>

### Mobile App Screenshots

<table>
  <tr>
    <td>
      <figure>
        <img src="screenshots/mobile/Screenshot_20251112_122620_Expo%20Go.jpg" alt="Mobile Screenshot 1" width="220">
        <figcaption>Splash Screen</figcaption>
      </figure><br>
      <figure>
        <img src="screenshots/mobile/Screenshot_20251112_122629_Expo%20Go.jpg" alt="Mobile Screenshot 2" width="220">
        <figcaption>Staff Dashboard</figcaption>
      </figure><br>
      <figure>
        <img src="screenshots/mobile/Screenshot_20251112_122710_Expo%20Go.jpg" alt="Mobile Screenshot 3" width="220">
        <figcaption>Appointment Scanner</figcaption>
      </figure><br>
      <figure>
        <img src="screenshots/mobile/Screenshot_20251112_122729_Expo%20Go.jpg" alt="Mobile Screenshot 4" width="220">
        <figcaption>Citizen List</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/mobile/Screenshot_20251112_122752_Expo%20Go.jpg" alt="Mobile Screenshot 5" width="220">
        <figcaption>Citizen Card (OCR)</figcaption>
      </figure><br>
      <figure>
        <img src="screenshots/mobile/Screenshot_20251112_122802_Expo%20Go.jpg" alt="Mobile Screenshot 6" width="220">
        <figcaption>Assigned Vaccine</figcaption>
      </figure><br>
      <figure>
        <img src="screenshots/mobile/Screenshot_20251112_122812_Expo%20Go.jpg" alt="Mobile Screenshot 7" width="220">
        <figcaption>Logs Entry</figcaption>
      </figure>
    </td>
    <td>
      <figure>
        <img src="screenshots/mobile/Screenshot_20251112_122820_Expo%20Go.jpg" alt="Mobile Screenshot 8" width="220">
        <figcaption>Staff Dashboard</figcaption>
      </figure><br>
      <figure>
        <img src="screenshots/mobile/Screenshot_20251112_122830_Expo%20Go.jpg" alt="Mobile Screenshot 9" width="220">
        <figcaption>Appointments</figcaption>
      </figure><br>
      <figure>
        <img src="screenshots/mobile/Screenshot_20251112_122841_Expo%20Go.jpg" alt="Mobile Screenshot 10" width="220">
        <figcaption>Upcoming Schedules</figcaption>
      </figure>
    </td>
  </tr>
</table>
