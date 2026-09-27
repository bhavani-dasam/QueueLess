const queueContainer =
    document.getElementById("queueContainer");

const emptyQueue =
    document.getElementById("emptyQueue");

const waitingCount =
    document.getElementById("waitingCount");

const currentToken =
    document.getElementById("currentToken");

const currentService =
    document.getElementById("currentService");

const completeCurrentButton =
    document.getElementById(
        "completeCurrentButton"
    );

const adminLocation =
    document.getElementById("adminLocation");


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        const location =
            adminLocation.value;


        // ----------------------------------
        // GET WAITING CUSTOMERS
        // ----------------------------------

        const queueResponse =
            await fetch(
                "/api/queue?location=" +
                encodeURIComponent(location)
            );


        const queue =
            await queueResponse.json();


        // ----------------------------------
        // GET CURRENT TOKEN
        // ----------------------------------

        const currentResponse =
            await fetch(
                "/api/current?location=" +
                encodeURIComponent(location)
            );


        const current =
            await currentResponse.json();


        // ----------------------------------
        // CURRENT TOKEN
        // ----------------------------------

        currentToken.textContent =
            current.token;


        if (current.token !== "--") {

            currentService.textContent =
                current.service;

            completeCurrentButton.style.display =
                "inline-block";

            completeCurrentButton.dataset.id =
                current.id;

        } else {

            currentService.textContent =
                "No customer is currently being served.";

            completeCurrentButton.style.display =
                "none";

            completeCurrentButton.dataset.id =
                "";

        }


        // ----------------------------------
        // WAITING COUNT
        // ----------------------------------

        waitingCount.textContent =
            queue.length;


        // ----------------------------------
        // CLEAR OLD QUEUE
        // ----------------------------------

        queueContainer.innerHTML = "";


        // ----------------------------------
        // EMPTY QUEUE
        // ----------------------------------

        if (queue.length === 0) {

            emptyQueue.style.display =
                "block";

        } else {

            emptyQueue.style.display =
                "none";

        }


        // ----------------------------------
        // DISPLAY WAITING CUSTOMERS
        // ----------------------------------

        queue.forEach(function (item) {

            const queueItem =
                document.createElement("div");


            queueItem.classList.add(
                "queue-item"
            );


            queueItem.innerHTML = `

                <div class="queue-token">

                    <h3>
                        ${item.token}
                    </h3>

                    <span class="waiting-badge">
                        Waiting
                    </span>

                </div>


                <div class="queue-details">

                    <p>
                        <strong>Location:</strong>
                        ${item.location}
                    </p>

                    <p>
                        <strong>Service:</strong>
                        ${item.service}
                    </p>

                </div>


                <button
                    class="call-button"
                    onclick="callNext(${item.id})">

                    Call Next

                </button>

            `;


            queueContainer.appendChild(
                queueItem
            );

        });


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


// ==========================================
// LOCATION CHANGE
// ==========================================

adminLocation.addEventListener(
    "change",
    function () {

        loadDashboard();

    }
);


// ==========================================
// CALL NEXT
// ==========================================

async function callNext(tokenId) {

    try {

        const response =
            await fetch(
                "/api/token/" +
                tokenId +
                "/call",
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        alert(data.message);


        if (response.ok) {

            await loadDashboard();

        }


    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong."
        );

    }

}


// ==========================================
// COMPLETE CURRENT TOKEN
// ==========================================

async function completeCurrentToken() {

    const tokenId =
        completeCurrentButton.dataset.id;


    if (!tokenId) {

        return;

    }


    try {

        const response =
            await fetch(
                "/api/token/" +
                tokenId +
                "/complete",
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        alert(data.message);


        if (response.ok) {

            await loadDashboard();

        }


    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong."
        );

    }

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadDashboard();