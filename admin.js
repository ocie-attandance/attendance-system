console.log("🔥 ADMIN.JS IMELOADED 🔥");
const SUPABASE_URL = "https://htdonnfzenmsoctnbefs.supabase.co";

console.log("ADMIN.JS IMELOADED");

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_NqSVXvNy2EAGxBCoGLQzjg_6DVquTKa";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// =====================================================
// ELEMENTS
// =====================================================

const attendanceDate =
    document.getElementById("attendanceDate");

const searchDateBtn =
    document.getElementById("searchDateBtn");

const todayBtn =
    document.getElementById("todayBtn");

const reportMonth =
    document.getElementById("reportMonth");

const searchMonthBtn =
    document.getElementById("searchMonthBtn");

const printMonthlyBtn =
    document.getElementById("printMonthlyBtn");

const monthlyTable =
    document.getElementById("monthlyTable");

const monthlyDetailsTable =
    document.getElementById("monthlyDetailsTable");

const monthlyMessage =
    document.getElementById("monthlyMessage");

const employeesTable =
    document.getElementById("employeesTable");

const employeeSearch =
    document.getElementById("employeeSearch");


// =====================================================
// TANZANIA TODAY
// =====================================================

function getTanzaniaDate() {

    return new Date().toLocaleDateString(
        "en-CA",
        {
            timeZone: "Africa/Dar_es_Salaam"
        }
    );

}


// =====================================================
// LOAD ATTENDANCE
// =====================================================

async function loadAttendance(selectedDate = null) {

    const message =
        document.getElementById("message");

    const attendanceTable =
        document.getElementById("attendanceTable");

    const totalRecords =
        document.getElementById("totalRecords");

    const currentlyIn =
        document.getElementById("currentlyIn");

    const currentlyOut =
        document.getElementById("currentlyOut");

    const todayDate =
        document.getElementById("todayDate");


    const today =
        selectedDate || getTanzaniaDate();


    // =================================================
    // DISPLAY DATE
    // =================================================

    const displayDate =
        new Date(
            today + "T00:00:00"
        ).toLocaleDateString(
            "sw-TZ",
            {
                timeZone:
                    "Africa/Dar_es_Salaam",
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    todayDate.textContent =
        displayDate;


    // =================================================
    // TITLES
    // =================================================

    const selectedDateIsToday =
        !selectedDate ||
        selectedDate === getTanzaniaDate();


    const cardTitles =
        document.querySelectorAll(".card-title");

    const tableTitle =
        document.querySelector(
            ".table-container h2"
        );


    if (cardTitles.length > 0) {

        if (selectedDateIsToday) {

            cardTitles[0].textContent =
                "Jumla ya Records Leo";

        } else {

            cardTitles[0].textContent =
                "Jumla ya Records";

        }

    }


    if (tableTitle) {

        if (selectedDateIsToday) {

            tableTitle.textContent =
                "Attendance ya Leo";

        } else {

            tableTitle.textContent =
                "Attendance ya " +
                displayDate;

        }

    }


    message.textContent =
        "Inapakia attendance...";


    try {

        // =============================================
        // GET ATTENDANCE
        // =============================================

const {
    data,
    error
} = await supabaseClient
    .from("attendance")
    .select(`
        id,
        employee_id,
        checkin,
        checkout,
        created_at,
        latitude,
        longitude,
        checkout_latitude,
        checkout_longitude,
        employees (
            full_name,
            employee_code
        )
    `)
    .order(
        "checkin",
        {
            ascending: false
        }
    );

        


        if (error) {
            throw error;
        }


        // =============================================
        // FILTER DATE
        // =============================================

        const records =
            (data || []).filter(
                function (record) {

                    if (!record.checkin) {
                        return false;
                    }


                    const recordDate =
                        new Date(
                            record.checkin
                        ).toLocaleDateString(
                            "en-CA",
                            {
                                timeZone:
                                    "Africa/Dar_es_Salaam"
                            }
                        );


                    return recordDate === today;

                }
            );


        attendanceTable.innerHTML = "";


        // =============================================
        // COUNTS
        // =============================================

        const inCount =
            records.filter(
                function (record) {

                    return (
                        record.checkin &&
                        !record.checkout
                    );

                }
            ).length;


        const outCount =
            records.filter(
                function (record) {

                    return (
                        record.checkin &&
                        record.checkout
                    );

                }
            ).length;


        totalRecords.textContent =
            records.length;

        currentlyIn.textContent =
            inCount;

        currentlyOut.textContent =
            outCount;


        // =============================================
        // NO DATA
        // =============================================

        if (records.length === 0) {

            const row =
                document.createElement("tr");

            const cell =
                document.createElement("td");

            cell.colSpan = 4;

            cell.className =
                "empty";

            cell.textContent =
                "Hakuna attendance ya tarehe hii.";

            row.appendChild(cell);

            attendanceTable.appendChild(row);

            message.textContent =
                "Hakuna attendance ya tarehe hii.";

            return;
        }


        // =============================================
        // DISPLAY RECORDS
        // =============================================

        records.forEach(
            function (record) {

                const row =
                    document.createElement("tr");


                const employeeName =
                    record.employees &&
                    record.employees.full_name
                        ? record.employees.full_name
                        : "Haijulikani";


                const checkIn =
                    record.checkin
                        ? new Date(
                            record.checkin
                        ).toLocaleTimeString(
                            "sw-TZ",
                            {
                                timeZone:
                                    "Africa/Dar_es_Salaam",
                                hour:
                                    "2-digit",
                                minute:
                                    "2-digit",
                                second:
                                    "2-digit"
                            }
                        )
                        : "-";


                const checkOut =
                    record.checkout
                        ? new Date(
                            record.checkout
                        ).toLocaleTimeString(
                            "sw-TZ",
                            {
                                timeZone:
                                    "Africa/Dar_es_Salaam",
                                hour:
                                    "2-digit",
                                minute:
                                    "2-digit",
                                second:
                                    "2-digit"
                            }
                        )
                        : "-";


                let status;
                let statusClass;


                if (
                    record.checkin &&
                    !record.checkout
                ) {

                    status =
                        "WAPO KAZINI";

                    statusClass =
                        "present";

                } else {

                    status =
                        "WAMEMALIZA";

                    statusClass =
                        "out";

                }
 
const checkInGPS =
    record.latitude != null && record.longitude != null
        ? `<br><a href="https://www.google.com/maps?q=${record.latitude},${record.longitude}" target="_blank" rel="noopener noreferrer">📍 ONA GPS</a>`
        : "";

const checkOutGPS =
    record.checkout_latitude != null && record.checkout_longitude != null
        ? `<br><a href="https://www.google.com/maps?q=${record.checkout_latitude},${record.checkout_longitude}" target="_blank" rel="noopener noreferrer">📍 ONA GPS</a>`
        : "";

row.innerHTML = `
    <td>
        ${employeeName}
    </td>

    <td>
        ${checkIn}
        ${checkInGPS}
    </td>

    <td>
        ${checkOut}
        ${checkOutGPS}
    </td>

    <td class="${statusClass}">
        ${status}
    </td>
`;

                attendanceTable.appendChild(row);

            }
        );


        message.textContent =
            "Attendance imepakiwa.";


    } catch (error) {

        console.error(
            "ADMIN ATTENDANCE ERROR:",
            error
        );

        message.textContent =
            "❌ Tatizo: " +
            error.message;

    }

}


// =====================================================
// SEARCH DATE
// =====================================================

if (searchDateBtn) {

    searchDateBtn.addEventListener(
        "click",
        function () {

            const selectedDate =
                attendanceDate.value;


            if (!selectedDate) {

                alert(
                    "Tafadhali chagua tarehe."
                );

                return;
            }


            loadAttendance(
                selectedDate
            );

        }
    );

}


// =====================================================
// TODAY
// =====================================================

if (todayBtn) {

    todayBtn.addEventListener(
        "click",
        function () {

            attendanceDate.value = "";

            loadAttendance();

        }
    );

}


// =====================================================
// MONTHLY REPORT
// =====================================================

async function loadMonthlyReport() {

    const selectedMonth =
        reportMonth.value;


    if (!selectedMonth) {

        alert(
            "Tafadhali chagua mwezi."
        );

        return;
    }


    monthlyMessage.textContent =
        "Inapakia ripoti ya mwezi...";


    monthlyTable.innerHTML = "";

    monthlyDetailsTable.innerHTML = "";


    try {

        // =============================================
        // GET ATTENDANCE
        // =============================================

        const {
            data,
            error
        } = await supabaseClient
            .from("attendance")
            .select(`
                id,
                employee_id,
                checkin,
                checkout,
                employees (
                    full_name,
                    employee_code
                )
            `)
            .order(
                "checkin",
                {
                    ascending: true
                }
            );


        if (error) {
            throw error;
        }


        // =============================================
        // FILTER MONTH
        // =============================================

        const records =
            (data || []).filter(
                function (record) {

                    if (!record.checkin) {
                        return false;
                    }


                   const recordDate =
    new Date(record.checkin).toLocaleDateString(
        "en-CA",
        {
            timeZone: "Africa/Dar_es_Salaam"
        }
    );

const recordMonth =
    recordDate.substring(0, 7);

return recordMonth === selectedMonth;

                }
            );


        // =============================================
        // NO DATA
        // =============================================

        if (records.length === 0) {

            const row =
                document.createElement("tr");

            const cell =
                document.createElement("td");

            cell.colSpan = 6;

            cell.className =
                "empty";

            cell.textContent =
                "Hakuna attendance mwezi huu.";

            row.appendChild(cell);

            monthlyDetailsTable.appendChild(row);

            monthlyMessage.textContent =
                "Hakuna attendance mwezi huu.";

            return;
        }


        // =============================================
        // MONTHLY DETAILS
        // =============================================

        records.forEach(
            function (record) {

                const row =
                    document.createElement("tr");


                const date =
                    new Date(
                        record.checkin
                    ).toLocaleDateString(
                        "sw-TZ",
                        {
                            timeZone:
                                "Africa/Dar_es_Salaam",
                            day:
                                "2-digit",
                            month:
                                "2-digit",
                            year:
                                "numeric"
                        }
                    );


                const employeeName =
                    record.employees &&
                    record.employees.full_name
                        ? record.employees.full_name
                        : "Haijulikani";


                const checkIn =
                    record.checkin
                        ? new Date(
                            record.checkin
                        ).toLocaleTimeString(
                            "sw-TZ",
                            {
                                timeZone:
                                    "Africa/Dar_es_Salaam",
                                hour:
                                    "2-digit",
                                minute:
                                    "2-digit",
                                second:
                                    "2-digit"
                            }
                        )
                        : "-";


                const checkOut =
                    record.checkout
                        ? new Date(
                            record.checkout
                        ).toLocaleString(
                            "sw-TZ",
                            {
                                timeZone:
                                    "Africa/Dar_es_Salaam",
                                day:
                                    "2-digit",
                                month:
                                    "2-digit",
                                year:
                                    "numeric",
                                hour:
                                    "2-digit",
                                minute:
                                    "2-digit",
                                second:
                                    "2-digit"
                            }
                        )
                        : "-";


                // =====================================
                // WORK DURATION
                // =====================================

                let workDuration = "-";


                if (
                    record.checkin &&
                    record.checkout
                ) {

                    const start =
                        new Date(
                            record.checkin
                        );

                    const end =
                        new Date(
                            record.checkout
                        );

                    const difference =
                        end - start;


                    const totalMinutes =
                        Math.floor(
                            difference / 60000
                        );


                    const hours =
                        Math.floor(
                            totalMinutes / 60
                        );


                    const minutes =
                        totalMinutes % 60;


                    workDuration =
                        hours +
                        "h " +
                        minutes +
                        "m";

                }


                const status =
                    record.checkout
                        ? "WAMEMALIZA"
                        : "WAPO KAZINI";


                row.innerHTML = `

                    <td>
                        ${date}
                    </td>

                    <td>
                        ${employeeName}
                    </td>

                    <td>
                        ${checkIn}
                    </td>

                    <td>
                        ${checkOut}
                    </td>

                    <td>
                        ${workDuration}
                    </td>

                    <td>
                        ${status}
                    </td>

                `;


                monthlyDetailsTable.appendChild(
                    row
                );

            }
        );


        // =============================================
        // GROUP EMPLOYEES
        // =============================================

        const employees = {};


        records.forEach(
            function (record) {

                const employeeId =
                    record.employee_id;


                if (!employees[employeeId]) {

                    employees[employeeId] = {

                        name:
                            record.employees &&
                            record.employees.full_name
                                ? record.employees.full_name
                                : "Haijulikani",

                        checkinDays:
                            new Set(),

                        checkoutDays:
                            new Set(),

                        records: 0

                    };

                }


                const recordDate =
                    new Date(
                        record.checkin
                    ).toLocaleDateString(
                        "en-CA",
                        {
                            timeZone:
                                "Africa/Dar_es_Salaam"
                        }
                    );


                employees[employeeId]
                    .checkinDays
                    .add(recordDate);


                if (record.checkout) {

                    employees[employeeId]
                        .checkoutDays
                        .add(recordDate);

                }


                employees[employeeId]
                    .records++;

            }
        );


        // =============================================
        // DISPLAY EMPLOYEE SUMMARY
        // =============================================

        Object.values(employees)
            .forEach(
                function (employee) {

                    const row =
                        document.createElement("tr");


                    row.innerHTML = `

                        <td>
                            ${employee.name}
                        </td>

                        <td>
                            ${employee.checkinDays.size}
                        </td>

                        <td>
                            ${employee.checkoutDays.size}
                        </td>

                        <td>
                            ${employee.records}
                        </td>

                    `;


                    monthlyTable.appendChild(
                        row
                    );

                }
            );


        monthlyMessage.textContent =
            "Ripoti ya mwezi imepakiwa.";


    } catch (error) {

        console.error(
            "MONTHLY REPORT ERROR:",
            error
        );

        monthlyMessage.textContent =
            "❌ Tatizo: " +
            error.message;

    }

}


// =====================================================
// SEARCH MONTH
// =====================================================

if (searchMonthBtn) {

    searchMonthBtn.addEventListener(
        "click",
        function () {

            loadMonthlyReport();

        }
    );

}

// =====================================================
// PRINT MONTHLY REPORT
// =====================================================

if (printMonthlyBtn) {

    printMonthlyBtn.addEventListener("click", function () {

        // Hakikisha kwanza mwezi umechaguliwa
        if (!reportMonth.value) {

            alert("Tafadhali chagua mwezi kwanza.");

            return;
        }

        // Hakikisha kuna ripoti
        if (
            monthlyDetailsTable.children.length === 0 &&
            monthlyTable.children.length === 0
        ) {

            alert(
                "Tafadhali bonyeza TAFUTA kwanza ili kupakia ripoti."
            );

            return;
        }

        // ================================
        // OPEN PRINT WINDOW
        // ================================

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=1200,height=800"
            );

        if (!printWindow) {

            alert(
                "Chrome imezuia dirisha la Print. Ruhusu pop-up kisha jaribu tena."
            );

            return;
        }

        const selectedMonth =
            reportMonth.value;

        const monthName =
            new Date(
                selectedMonth + "-01T00:00:00"
            ).toLocaleDateString(
                "sw-TZ",
                {
                    month: "long",
                    year: "numeric"
                }
            );

        // ================================
        // PRINT PAGE
        // ================================

        printWindow.document.write(`

<!DOCTYPE html>

<html lang="sw">

<head>

    <meta charset="UTF-8">

    <title>
        Ripoti ya Mwezi - ${monthName}
    </title>

    <style>

        body {
            font-family: Arial, sans-serif;
            margin: 30px;
            color: #000;
        }

        h1 {
            text-align: center;
            margin-bottom: 5px;
        }

        h2 {
            text-align: center;
            margin-top: 5px;
            margin-bottom: 25px;
        }

        .header-info {
            text-align: center;
            margin-bottom: 25px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        th,
        td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }

        th {
            background: #f0f0f0;
        }

        .report-title {
            margin-top: 25px;
            margin-bottom: 10px;
        }

        @media print {

            body {
                margin: 15mm;
            }

            button {
                display: none;
            }

        }

    </style>

</head>

<body>

    <h1>
        ATTENDANCE SYSTEM
    </h1>

    <h2>
        RIPOTI YA MWEZI - ${monthName}
    </h2>

    <div class="header-info">
        Imetolewa kutoka kwenye mfumo wa Attendance
    </div>

    <h3 class="report-title">
        Maelezo ya Attendance
    </h3>

    <table>

        <thead>

            <tr>
                <th>TAREHE</th>
                <th>MFANYAKAZI</th>
                <th>CHECK IN</th>
                <th>CHECK OUT</th>
                <th>MUDA</th>
                <th>STATUS</th>
            </tr>

        </thead>

        <tbody>

            ${monthlyDetailsTable.innerHTML}

        </tbody>

    </table>

    <h3 class="report-title">
        Muhtasari wa Wafanyakazi
    </h3>

    <table>

        <thead>

            <tr>
                <th>MFANYAKAZI</th>
                <th>SIKU ALIZOINGIA</th>
                <th>SIKU ALIZOMALIZA</th>
                <th>RECORDS</th>
            </tr>

        </thead>

        <tbody>

            ${monthlyTable.innerHTML}

        </tbody>

    </table>

</body>

</html>

        `);

        printWindow.document.close();

        // ================================
        // PRINT
        // ================================

        printWindow.focus();

        setTimeout(function () {

            printWindow.print();

        }, 500);

    });

}

// =====================================================
// LOAD EMPLOYEES
// =====================================================

async function loadEmployees() {

    if (!employeesTable) {
        return;
    }

    employeesTable.innerHTML = `
        <tr>
            <td colspan="6" class="empty">
                Inapakia wafanyakazi...
            </td>
        </tr>
    `;

    try {

        // ==========================================
        // GET EMPLOYEES
        // ==========================================

        const {
            data: employees,
            error: employeeError
        } = await supabaseClient
            .from("employees")
            .select(`
                id,
                full_name,
                employee_code,
                phone,
                user_id,
                is_active
              `)
            .eq("is_active", true)
            .order("full_name", {
                ascending: true
            });

        if (employeeError) {
            throw employeeError;
        }


        // ==========================================
        // GET AUTH EMAILS
        // ==========================================

        const {
            data: emailData,
            error: emailError
        } = await supabaseClient.functions.invoke(
            "get_employee_emails"
        );

        if (emailError) {
            throw emailError;
        }


        // ==========================================
        // EMAIL LOOKUP
        // ==========================================

        const emailMap = {};

        if (emailData && emailData.users) {

            emailData.users.forEach(function (user) {

                emailMap[user.user_id] =
                    user.email || "-";

            });

        }


        // ==========================================
        // CLEAR TABLE
        // ==========================================

        employeesTable.innerHTML = "";


        // ==========================================
        // NO EMPLOYEES
        // ==========================================

        if (!employees || employees.length === 0) {

            employeesTable.innerHTML = `
                <tr>
                    <td colspan="6" class="empty">
                        Hakuna wafanyakazi.
                    </td>
                </tr>
            `;

            return;
        }


        // ==========================================
        // DISPLAY EMPLOYEES
        // ==========================================

        employees.forEach(function (employee) {

            const row =
                document.createElement("tr");

            const employeeEmail =
                emailMap[employee.user_id] || "-";


            row.innerHTML = `

                <td>
                    ${employee.full_name || "-"}
                </td>

                <td>
                    ${employee.employee_code || "-"}
                </td>

                <td>
                    ${employee.phone || "-"}
                </td>

                <td>
                    ${employeeEmail}
                </td>

                <td>

                    <button
                        type="button"
                        class="view-attendance-btn"
                        data-id="${employee.id}"
                    >
                        ANGALIA
                    </button>

                </td>

                <td>

                    <button
                        type="button"
                        class="edit-employee-btn"
                        data-id="${employee.id}"
                    >
                        EDIT
                    </button>
                    <button
                       type="button"
                       class="delete-employee-btn"
                       data-id="${employee.id}"
                       data-name="${employee.full_name || ""}"
                    >
                       FUTA
                       </button>
                </td>

            `;


            employeesTable.appendChild(row);

        });


    } catch (error) {

        console.error(
            "EMPLOYEES ERROR:",
            error
        );

        employeesTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    ❌ Tatizo: ${error.message}
                </td>
            </tr>
        `;

    }

}
// =====================================================
// EMPLOYEE SEARCH
// =====================================================

if (employeeSearch) {

    employeeSearch.addEventListener(
        "input",
        function () {

            const search =
                employeeSearch.value
                    .trim()
                    .toLowerCase();


            const rows =
                employeesTable.querySelectorAll(
                    "tr"
                );


            rows.forEach(
                function (row) {

                    const text =
                        row.textContent
                            .toLowerCase();


                    if (
                        text.includes(search)
                    ) {

                        row.style.display =
                            "";

                    } else {

                        row.style.display =
                            "none";

                    }

                }
            );

        }
    );

}


// =====================================================
// VIEW EMPLOYEE ATTENDANCE
// =====================================================
if (employeesTable) {

    employeesTable.addEventListener(
        "click",
        async function (event) {

            if (
                !event.target.classList.contains(
                    "view-attendance-btn"
                )
            ) {
                return;
            }

            const employeeId =
                event.target.dataset.id;

            const employeeAttendanceDetails =
                document.getElementById(
                    "employeeAttendanceDetails"
                );

            const selectedEmployeeName =
                document.getElementById(
                    "selectedEmployeeName"
                );

            const employeeAttendanceTable =
                document.getElementById(
                    "employeeAttendanceTable"
                );


            try {

                const {
                    data,
                    error
                } = await supabaseClient
                    .from("attendance")
                    .select(`
                        id,
                        checkin,
                        checkout,
                        status,
                        created_at,
                        employees (
                            full_name,
                            employee_code
                        )
                    `)
                    .eq(
                        "employee_id",
                        employeeId
                    )
                    .order(
                        "checkin",
                        {
                            ascending: false
                        }
                    );


                if (error) {
                    throw error;
                }


                // =========================
                // SHOW DETAILS SECTION
                // =========================

                employeeAttendanceDetails.style.display =
                    "block";


                // =========================
                // EMPLOYEE NAME
                // =========================

                if (
                    data &&
                    data.length > 0 &&
                    data[0].employees
                ) {

                    const employee =
                        data[0].employees;

                    selectedEmployeeName.textContent =
                        employee.full_name +
                        " (" +
                        employee.employee_code +
                        ")";

                } else {

                    selectedEmployeeName.textContent =
                        "Attendance ya mfanyakazi";

                }


                employeeAttendanceTable.innerHTML =
                    "";


                // =========================
                // NO DATA
                // =========================

                if (
                    !data ||
                    data.length === 0
                ) {

                    const row =
                        document.createElement("tr");

                    const cell =
                        document.createElement("td");

                    cell.colSpan = 6;

                    cell.className =
                        "empty";

                    cell.textContent =
                        "Hakuna attendance ya mfanyakazi huyu.";

                    row.appendChild(cell);

                    employeeAttendanceTable.appendChild(
                        row
                    );

                    employeeAttendanceDetails.scrollIntoView({
                        behavior: "smooth"
                    });

                    return;
                }


                // =========================
                // DISPLAY RECORDS
                // =========================

                data.forEach(
                    function (record) {

                        const row =
                            document.createElement("tr");


                        // -------------------------
                        // DATE
                        // -------------------------

                        const date =
                            record.checkin
                                ? new Date(
                                    record.checkin
                                ).toLocaleDateString(
                                    "sw-TZ",
                                    {
                                        timeZone:
                                            "Africa/Dar_es_Salaam",
                                        day:
                                            "2-digit",
                                        month:
                                            "2-digit",
                                        year:
                                            "numeric"
                                    }
                                )
                                : "-";


                        // -------------------------
                        // EMPLOYEE
                        // -------------------------

                        const employeeName =
                            record.employees &&
                            record.employees.full_name
                                ? record.employees.full_name
                                : "-";


                        // -------------------------
                        // CHECK IN
                        // -------------------------

                        const checkIn =
                            record.checkin
                                ? new Date(
                                    record.checkin
                                ).toLocaleTimeString(
                                    "sw-TZ",
                                    {
                                        timeZone:
                                            "Africa/Dar_es_Salaam",
                                        hour:
                                            "2-digit",
                                        minute:
                                            "2-digit",
                                        second:
                                            "2-digit"
                                    }
                                )
                                : "-";


                        // -------------------------
                        // CHECK OUT
                        // -------------------------

                        const checkOut =
                            record.checkout
                                ? new Date(
                                    record.checkout
                                ).toLocaleTimeString(
                                    "sw-TZ",
                                    {
                                        timeZone:
                                            "Africa/Dar_es_Salaam",
                                        hour:
                                            "2-digit",
                                        minute:
                                            "2-digit",
                                        second:
                                            "2-digit"
                                    }
                                )
                                : "-";


                        // -------------------------
                        // WORK DURATION
                        // -------------------------

                        let workDuration = "-";


                        if (
                            record.checkin &&
                            record.checkout
                        ) {

                            const start =
                                new Date(
                                    record.checkin
                                );

                            const end =
                                new Date(
                                    record.checkout
                                );

                            const difference =
                                end - start;


                            const totalMinutes =
                                Math.floor(
                                    difference / 60000
                                );


                            const hours =
                                Math.floor(
                                    totalMinutes / 60
                                );


                            const minutes =
                                totalMinutes % 60;


                            workDuration =
                                hours +
                                "h " +
                                minutes +
                                "m";

                        }


                        // -------------------------
                        // STATUS
                        // -------------------------

                        const status =
                            record.checkout
                                ? "WAMEMALIZA"
                                : "WAPO KAZINI";


                        // -------------------------
                        // ROW
                        // -------------------------

                        row.innerHTML = `

    <td>
        ${employee.full_name || "-"}
    </td>

    <td>
        ${employee.employee_code || "-"}
    </td>

    <td>
        ${employee.phone || "-"}
    </td>

    <td>
        ${employeeEmail}
    </td>

    <td>

        <button
            type="button"
            class="view-attendance-btn"
            data-id="${employee.id}"
        >
            ANGALIA
        </button>

    </td>

     <td>

                    <button
                        type="button"
                        class="edit-employee-btn"
                        data-id="${employee.id}"
                    >
                        EDIT
                    </button>

                    <button
                        type="button"
                        class="delete-employee-btn"
                        data-id="${employee.id}"
                        data-name="${employee.full_name || ""}"
                    >
                        🗑️ FUTA
                    </button>

                </td>

`;
                        employeesTable.appendChild(row);

                    }
                );


                // =========================
                // SCROLL TO REPORT
                // =========================

                employeeAttendanceDetails.scrollIntoView({
                    behavior: "smooth"
                });


            } catch (error) {

                console.error(
                    "VIEW EMPLOYEE ATTENDANCE ERROR:",
                    error
                );


                employeeAttendanceDetails.style.display =
                    "block";


                employeeAttendanceTable.innerHTML = `

                    <tr>

                        <td
                            colspan="6"
                            class="empty"
                        >
                            ❌ Tatizo:
                            ${error.message}
                        </td>

                    </tr>

                `;

            }

        }
    );

}
// =====================================================
// ADMIN SECURITY
// =====================================================

async function checkAdminAccess() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    // =============================================
    // HAKUNA LOGIN
    // =============================================

    if (!session) {

        window.location.href =
            "index.html";

        return;
    }


    const user =
        session.user;
        console.log("ADMIN USER ID:", user.id);
        console.log("ADMIN EMAIL:", user.email);

// =============================================
// CHECK ADMIN ROLE
// =============================================

const {
    data: employee,
    error: employeeError
} = await supabaseClient
    .from("employees")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

if (employeeError) {

    console.error(
        "ADMIN ROLE ERROR:",
        employeeError
    );

    alert(
        "Imeshindikana kuthibitisha ruhusa ya Admin."
    );

    await supabaseClient.auth.signOut();

    window.location.href =
        "index.html";

    return;
}
// =============================================
// NOT ADMIN
// =============================================

if (
    !employee ||
    employee.role !== "admin"
) {

    console.log("NOT ADMIN:", employee);

    alert(
        "Huna ruhusa ya kufungua Admin Dashboard."
    );

    await supabaseClient.auth.signOut();

    window.location.href =
        "index.html";

    return;
}


// =============================================
// ADMIN ACCESS OK
// =============================================

console.log(
    "ADMIN ACCESS OK:",
    user.email
);

// =============================================
// ADMIN ACCESS OK
// =============================================

console.log(
    "ADMIN ACCESS OK:",
    user.email
);
} // Funga checkAdminAccess
// =====================================================
// ADMIN LOGOUT
// =====================================================

const adminLogoutBtn =
    document.getElementById(
        "adminLogoutBtn"
    );


if (adminLogoutBtn) {

    adminLogoutBtn.addEventListener(
        "click",
        async function () {

            await supabaseClient.auth.signOut();

            window.location.href =
                "index.html";

        }
    );

}

// =====================================================
// ADD NEW EMPLOYEE
// =====================================================

const addEmployeeBtn =
    document.getElementById("addEmployeeBtn");

const newEmployeeName =
    document.getElementById("newEmployeeName");

const newEmployeeCode =
    document.getElementById("newEmployeeCode");

const newEmployeePhone =
    document.getElementById("newEmployeePhone");

const newEmployeeEmail =
    document.getElementById("newEmployeeEmail");

const newEmployeePassword =
    document.getElementById("newEmployeePassword");

const addEmployeeMessage =
    document.getElementById("addEmployeeMessage");


if (addEmployeeBtn) {

    console.log("ADD EMPLOYEE BUTTON IPO");

    addEmployeeBtn.addEventListener("click", async function () {

        console.log("ADD EMPLOYEE CLICKED");

        const fullName =
            newEmployeeName.value.trim();

        const employeeCode =
            newEmployeeCode.value.trim();

        const phone =
            newEmployeePhone.value.trim();

        const email =
            newEmployeeEmail.value.trim();

        const password =
            newEmployeePassword.value;


        // =========================
        // VALIDATION
        // =========================

        if (
            !fullName ||
            !employeeCode ||
            !phone ||
            !email ||
            !password
        ) {

            addEmployeeMessage.textContent =
                "❌ Tafadhali jaza taarifa zote.";

            return;
        }


        if (password.length < 6) {

            addEmployeeMessage.textContent =
                "❌ Password iwe na angalau herufi 6.";

            return;
        }


        addEmployeeMessage.textContent =
            "⏳ Inasajili mfanyakazi...";


        try {

            // =========================
            // CALL EDGE FUNCTION
            // =========================

            const { data, error } =
                await supabaseClient.functions.invoke(
                    "create_employee",
                    {
                        body: {
                            full_name: fullName,
                            phone: phone,
                            employee_code: employeeCode,
                            email: email,
                            password: password
                        }
                    }
                );


            console.log(
                "CREATE EMPLOYEE RESPONSE:",
                data
            );


            // =========================
            // FUNCTION ERROR
            // =========================

            if (error) {

                console.error(
                    "CREATE EMPLOYEE ERROR:",
                    error
                );

                addEmployeeMessage.textContent =
                    "❌ " +
                    (
                        error.message ||
                        "Kuna tatizo kwenye server."
                    );

                return;
            }


            // =========================
            // SERVER ERROR
            // =========================

            if (!data || data.error) {

                addEmployeeMessage.textContent =
                    "❌ " +
                    (
                        data?.error ||
                        "Mfanyakazi hakusajiliwa."
                    );

                return;
            }


            // =========================
            // SUCCESS
            // =========================

            addEmployeeMessage.textContent =
                "✅ Mfanyakazi amesajiliwa. Anaweza ku-login sasa.";


            // =========================
            // CLEAR FORM
            // =========================

            newEmployeeName.value = "";
            newEmployeeCode.value = "";
            newEmployeePhone.value = "";
            newEmployeeEmail.value = "";
            newEmployeePassword.value = "";


            // =========================
            // REFRESH EMPLOYEE LIST
            // =========================

            loadEmployees();

        } catch (error) {

            console.error(
                "ADD EMPLOYEE ERROR:",
                error
            );

            addEmployeeMessage.textContent =
                "❌ Tatizo: " +
                (
                    error.message ||
                    "Mfanyakazi hakusajiliwa."
                );
        }

    });

}

// =====================================================
// EDIT EMPLOYEE
// =====================================================

const editEmployeeBox =
    document.getElementById("editEmployeeBox");

const editEmployeeId =
    document.getElementById("editEmployeeId");

const editEmployeeName =
    document.getElementById("editEmployeeName");

const editEmployeePhone =
    document.getElementById("editEmployeePhone");

const editEmployeeCode =
    document.getElementById("editEmployeeCode");
    const editEmployeeEmail =
    document.getElementById("editEmployeeEmail");

const editEmployeeRole =
    document.getElementById("editEmployeeRole");

const saveEmployeeEditBtn =
    document.getElementById("saveEmployeeEditBtn");

const editEmployeeMessage =
    document.getElementById("editEmployeeMessage");

const cancelEmployeeEditBtn =
    document.getElementById("cancelEmployeeEditBtn");

// =====================================================
// EDIT EMPLOYEE BUTTON
// =====================================================

document.addEventListener("click", async function (event) {

    const button = event.target.closest(".edit-employee-btn");

    if (!button) return;

    console.log("EDIT BUTTON IMEBONYEZWA");

    const employeeId = button.dataset.id;

    console.log("EMPLOYEE ID:", employeeId);

    if (!employeeId) {
        alert("ID ya mfanyakazi haijapatikana.");
        return;
    }

    try {

        editEmployeeMessage.textContent =
            "Inapakia taarifa...";

        const { data: employee, error } =
            await supabaseClient
                .from("employees")
                .select("id, full_name, employee_code, phone, user_id, role")
                .eq("id", employeeId)
                .single();

        if (error) throw error;

        console.log("EMPLOYEE DATA:", employee);

        editEmployeeId.value = employee.id;
        editEmployeeName.value = employee.full_name || "";
        editEmployeePhone.value = employee.phone || "";
        editEmployeeCode.value = employee.employee_code || "";

        if (editEmployeeRole) {
            editEmployeeRole.value = employee.role || "employee";
        }

        if (editEmployeeEmail) {
            editEmployeeEmail.value = "";
        }

        editEmployeeMessage.textContent = "";

        editEmployeeBox.style.display = "block";

        editEmployeeBox.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {

        console.error("EDIT ERROR:", error);

        editEmployeeMessage.textContent =
            "❌ Tatizo: " + error.message;

    }

});

// =====================================================
// SAVE EMPLOYEE EDIT
// =====================================================

if (saveEmployeeEditBtn) {

    saveEmployeeEditBtn.addEventListener(
        "click",
        async function () {

            const id = editEmployeeId.value;

            const fullName =
                editEmployeeName.value.trim();

            const phone =
                editEmployeePhone.value.trim();

            const employeeCode =
                editEmployeeCode.value.trim();

            if (!id || !fullName || !phone || !employeeCode) {

                editEmployeeMessage.textContent =
                    "❌ Jaza Jina, Simu na Employee Code.";

                return;
            }

            editEmployeeMessage.textContent =
                "Inahifadhi mabadiliko...";

            saveEmployeeEditBtn.disabled = true;

            try {

                const { data, error } =
                    await supabaseClient
                        .from("employees")
                        .update({
                            full_name: fullName,
                            phone: phone,
                            employee_code: employeeCode
                        })
                        .eq("id", id)
                        .select("id");

                if (error) throw error;

                if (!data || data.length === 0) {
                    throw new Error(
                        "Hakuna taarifa iliyobadilishwa. Kagua ruhusa za Supabase."
                    );
                }

                editEmployeeMessage.textContent =
                    "✅ Mabadiliko yamehifadhiwa.";

                await loadEmployees();
employeesTable.scrollIntoView({
    behavior: "smooth",
    block: "start"
});
                setTimeout(function () {

                    editEmployeeBox.style.display = "none";

                }, 1000);
                

            } catch (error) {

                console.error(
                    "SAVE EMPLOYEE ERROR:",
                    error
                );

                editEmployeeMessage.textContent =
                    "❌ Imeshindikana kuhifadhi: " +
                    error.message;

            } finally {

                saveEmployeeEditBtn.disabled = false;

            }

        }
    );

}

// =====================================================
// CANCEL EDIT
// =====================================================

if (cancelEmployeeEditBtn) {

    cancelEmployeeEditBtn.addEventListener(
        "click",
        function () {

            editEmployeeBox.style.display =
                "none";

            editEmployeeMessage.textContent =
                "";

        }
    );

}
// =====================================================
// START SYSTEM
// =====================================================
console.log("🔥 SYSTEM STARTING 🔥");
loadAttendance();

loadEmployees();

checkAdminAccess();
// =====================================================
// DISABLE EMPLOYEE LOGIN — FUTA BUTTON
// =====================================================


 // =====================================================
 // HIDE EMPLOYEE FROM ACTIVE LIST
 // =====================================================

if (employeesTable) {

    employeesTable.addEventListener("click", async function (event) {

        const button = event.target.closest(".delete-employee-btn");

        if (!button) return;

        const employeeId = button.dataset.id;
        const employeeName = button.dataset.name || "mfanyakazi huyu";

        if (!employeeId) {
            alert("ID ya mfanyakazi haijapatikana.");
            return;
        }

        const confirmed = confirm(
            `Unataka kumtoa ${employeeName} kwenye orodha ya kawaida?\n\n` +
            "Historia yake ya attendance haitafutwa."
        );

        if (!confirmed) return;

        button.disabled = true;
        button.textContent = "Inahifadhi...";

        try {

            const { data, error } = await supabaseClient
                .from("employees")
                .update({ is_active: false })
                .eq("id", employeeId)
                .select("id");

            if (error) throw error;

            if (!data || data.length === 0) {
                throw new Error(
                    "Hakuna mabadiliko yaliyohifadhiwa. Kagua ruhusa za Supabase."
                );
            }

            alert(
                `${employeeName} ameondolewa kwenye orodha ya kawaida. ` +
                "Historia ya attendance imehifadhiwa."
            );

            await loadEmployees();

        } catch (error) {

            console.error("HIDE EMPLOYEE ERROR:", error);

            alert("Imeshindikana: " + error.message);

            button.disabled = false;
            button.textContent = "FUTA";
        }

    });

}
