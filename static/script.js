const locationSelect =
    document.getElementById("location");

const serviceSelect =
    document.getElementById("service");

const tokenButton =
    document.getElementById("tokenButton");

const tokenResult =
    document.getElementById("tokenResult");

const tokenNumber =
    document.getElementById("tokenNumber");

const peopleAhead =
    document.getElementById("peopleAhead");

const waitTime =
    document.getElementById("waitTime");


// ==========================================
// SERVICES
// ==========================================

const services = {

    "City Hospital": [
        "Doctor Consultation",
        "Pharmacy",
        "Billing"
    ],

    "TCS Canteen": [
        "Food Order",
        "Pickup",
        "Billing"
    ],

    "ABC Bank": [
        "Cash Counter",
        "Account Services",
        "Loans"
    ],

    "QuickFix Service Center": [
        "Repair",
        "Service Booking",
        "Pickup"
    ]

};


// ==========================================
// LOCATION CHANGE
// ==========================================

locationSelect.addEventListener(
    "change",
    function () {

        const selectedLocation =
            locationSelect.value;

        serviceSelect.innerHTML =
            '<option value="">Choose a service</option>';


        if (selectedLocation === "") {
            return;
        }


        const availableServices =
            services[selectedLocation];


        availableServices.forEach(
            function (service) {

                const option =
                    document.createElement("option");

                option.value = service;

                option.textContent = service;

                serviceSelect.appendChild(option);

            }
        );

    }
);


// ==========================================
// GET TOKEN
// ==========================================

tokenButton.addEventListener(
    "click",
    async function () {

        const selectedLocation =
            locationSelect.value;

        const selectedService =
            serviceSelect.value;


        if (
            selectedLocation === "" ||
            selectedService === ""
        ) {

            alert(
                "Please select a location and service."
            );

            return;
        }


        try {

            const response =
                await fetch("/api/token", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        location:
                            selectedLocation,

                        service:
                            selectedService

                    })

                });


            const data =
                await response.json();


            tokenNumber.textContent =
                data.token;

            peopleAhead.textContent =
                data.people_ahead;

            waitTime.textContent =
                data.wait_time +
                " minutes";


            tokenResult.style.display =
                "block";


        } catch (error) {

            console.error(error);

            alert(
                "Unable to create token."
            );

        }

    }
);