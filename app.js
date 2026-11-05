const SUPABASE_URL = "https://htdonnfzenmsoctnbefs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NqSVXvNy2EAGxBCoGLQzjg_6DVquTKa";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// =========================
// ELEMENTS
// =========================

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

const dashboard = document.getElementById("dashboard");
const welcome = document.getElementById("welcome");

const checkInBtn = document.getElementById("checkInBtn");
const checkOutBtn = document.getElementById("checkOutBtn");
const logoutBtn = document.getElementById("logoutBtn");

const attendanceMessage =
    document.getElementById("attendanceMessage");


// =========================
// LOGIN
// =========================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    message.textContent = "Inaingia...";

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {

        console.error("LOGIN ERROR:", error);

        message.textContent =
            "Login imeshindikana: " + error.message;

        return;
    }

    console.log("LOGIN USER:", data.user);
// // CHECK ADMIN ROLE
    const { data: employee, error: roleError } =
        await supabaseClient
            .from("employees")
            .select("role")
            .eq("user_id", data.user.id)
            .maybeSingle();

    if (roleError) {
        console.error("ROLE ERROR:", roleError);

        message.textContent =
            "Imeshindikana kuthibitisha ruhusa. Jaribu tena.";

        await supabaseClient.auth.signOut();
        return;
    }

    if (employee && employee.role === "admin") {
        console.log("ADMIN LOGIN:", data.user.email);

        window.location.href = "admin.html";
        return;
    }

// =========================
// EMPLOYEE LOGIN
// =========================

loginForm.style.display = "none";

if (dashboard) {
    dashboard.style.display = "block";
}

await loadEmployee(data.user.id);
});


// =========================
// LOAD EMPLOYEE
// =========================

async function loadEmployee(userId) {

    const {
        data,
        error
    } = await supabaseClient
        .from("employees")
        .select("*")
        .eq("user_id", userId)
        .limit(1);

    if (error) {

        console.error("LOAD EMPLOYEE ERROR:", error);

        welcome.textContent =
            "Tatizo la kupata taarifa za mfanyakazi.";

        return;
    }

    if (!data || data.length === 0) {

        console.error(
            "Hakuna employee anayelingana na user_id:",
            userId
        );

        welcome.textContent =
            "Mtumiaji ameingia, lakini taarifa za mfanyakazi hazijapatikana.";

        return;
    }

    const employee = data[0];

    window.currentEmployee = employee;

    welcome.textContent =
        "Karibu, " + employee.full_name;

    console.log(
        "CURRENT EMPLOYEE:",
        window.currentEmployee
    );

    await checkAttendanceStatus();
}


// =========================
// CHECK ATTENDANCE STATUS
// =========================

async function checkAttendanceStatus() {

    if (
        !window.currentEmployee ||
        !window.currentEmployee.id
    ) {
        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("attendance")
        .select("id, employee_id, checkin, checkout, created_at")
        .eq(
            "employee_id",
            window.currentEmployee.id
        )
        .not("checkin", "is", null)
        .is("checkout", null)
        .order("created_at", {
            ascending: false
        })
        .limit(1);

    if (error) {

        console.error(
            "ATTENDANCE STATUS ERROR:",
            error
        );

        attendanceMessage.textContent =
            "❌ Tatizo la kuangalia attendance: " +
            error.message;

        return;
    }

    // Kuna CHECK IN ambayo bado haija-checkout
    if (data && data.length > 0) {

        checkInBtn.style.display = "none";
        checkOutBtn.style.display = "block";

        attendanceMessage.textContent =
            "Tayari umefanya CHECK IN. Fanya CHECK OUT kwanza.";

        return;
    }

    // Hakuna CHECK IN inayosubiri CHECK OUT
    checkInBtn.style.display = "block";
    checkOutBtn.style.display = "none";

    attendanceMessage.textContent = "";
}


// =========================
// CHECK IN
// =========================

async function getEmployeeGPS() {
    return new Promise((resolve, reject) => {

        if (!navigator.geolocation) {
            reject(
                new Error("Kivinjari chako hakitumii GPS.")
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            
function (position) {
    console.log("GPS LATITUDE:", position.coords.latitude);
    console.log("GPS LONGITUDE:", position.coords.longitude);
    console.log("GPS ACCURACY (mita):", position.coords.accuracy);

    resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
    });
},

            function (error) {
                reject(
                    new Error(
                        "Imeshindwa kupata GPS. Ruhusu location kwenye Chrome. " +
                        error.message
                    )
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );

    });
}

checkInBtn.addEventListener(
    "click",
    async function () {

        attendanceMessage.textContent =
            "Inahifadhi CHECK IN...";

        try {

            if (
                !window.currentEmployee ||
                !window.currentEmployee.id
            ) {
                throw new Error(
                    "Taarifa za mfanyakazi hazijapatikana."
                );
            }

            // Hakikisha hana CHECK IN ambayo bado hajafanya CHECK OUT
            const {
                data: existing,
                error: existingError
            } = await supabaseClient
                .from("attendance")
                .select("id, checkin, checkout")
                .eq(
                    "employee_id",
                    window.currentEmployee.id
                )
                .not("checkin", "is", null)
                .is("checkout", null)
                .limit(1);

            if (existingError) {
                throw existingError;
            }

            if (
                existing &&
                existing.length > 0
            ) {
                throw new Error(
                    "Tayari umefanya CHECK IN. Fanya CHECK OUT kwanza."
                );
            }

             
            // Pata GPS ya mfanyakazi
            attendanceMessage.textContent =
                "Inatafuta eneo la GPS...";

            const gps = await getEmployeeGPS();

            // Hifadhi CHECK IN pamoja na GPS
            const {
                error: attendanceError
            } = await supabaseClient
                .from("attendance")
                .insert({
                    employee_id:
                        window.currentEmployee.id,

                    checkin:
                        new Date().toISOString(),

                    latitude: gps.latitude,
                    longitude: gps.longitude,

                    status: "present"
                });

            if (attendanceError) {
                throw attendanceError;
            }


            attendanceMessage.textContent =
                "✅ CHECK IN imefanikiwa!";

            checkInBtn.style.display = "none";
            checkOutBtn.style.display = "block";

        } catch (error) {

            console.error(
                "CHECK IN ERROR:",
                error
            );

            attendanceMessage.textContent =
                "❌ Tatizo: " + error.message;
        }
    }
);


// =========================
// CHECK OUT
// =========================

checkOutBtn.addEventListener(
    "click",
    async function () {

        attendanceMessage.textContent =
            "Inahifadhi CHECK OUT...";

        try {

            if (
                !window.currentEmployee ||
                !window.currentEmployee.id
            ) {
                throw new Error(
                    "Taarifa za mfanyakazi hazijapatikana."
                );
            }

            // Tafuta CHECK IN ya mwisho ambayo bado haina CHECK OUT
            const {
                data: attendance,
                error: findError
            } = await supabaseClient
                .from("attendance")
                .select(
                    "id, employee_id, checkin, checkout, created_at"
                )
                .eq(
                    "employee_id",
                    window.currentEmployee.id
                )
                .not("checkin", "is", null)
                .is("checkout", null)
                .order("created_at", {
                    ascending: false
                })
                .limit(1);

            if (findError) {
                throw findError;
            }

            if (
                !attendance ||
                attendance.length === 0
            ) {
                throw new Error(
                    "Hakuna CHECK IN inayosubiri CHECK OUT."
                );
            }

            const attendanceId =
                attendance[0].id;

            console.log(
                "CHECK OUT RECORD:",
                attendance[0]
            );

            
            // Pata GPS ya mfanyakazi wakati wa CHECK OUT
            attendanceMessage.textContent =
                "Inatafuta GPS ya CHECK OUT...";

            const gps = await getEmployeeGPS();

            // Hifadhi muda na GPS ya CHECK OUT
            const {
                error: updateError
            } = await supabaseClient
                .from("attendance")
                .update({
                    checkout:
                        new Date().toISOString(),

                    checkout_latitude:
                        gps.latitude,

                    checkout_longitude:
                        gps.longitude,

                    status: "completed"
                })
                .eq("id", attendanceId);

            if (updateError) {
                throw updateError;
            }


            attendanceMessage.textContent =
                "✅ CHECK OUT imefanikiwa!";

            checkInBtn.style.display = "block";
            checkOutBtn.style.display = "none";

        } catch (error) {

            console.error(
                "CHECK OUT ERROR:",
                error
            );

            attendanceMessage.textContent =
                "❌ Tatizo: " + error.message;
        }
    }
);


// =========================
// LOGOUT
// =========================

logoutBtn.addEventListener(
    "click",
    async function () {

        await supabaseClient.auth.signOut();

        window.currentEmployee = null;

        if (dashboard) {
            dashboard.style.display = "none";
        }

        loginForm.style.display = "block";

        document.getElementById("email").value = "";
        document.getElementById("password").value = "";

        message.textContent = "";
        attendanceMessage.textContent = "";
    }
);