
let pratifalCounter = 1;
// Function to add a new PRATIFAL section
function addPratifal() {
    pratifalCounter++;

    const newPratifal = document.createElement("div");
    newPratifal.className = "pratifal-section";
    newPratifal.innerHTML = `
            <div style="display: flex;justify-content: space-between;">
                <p>PRATIFAL ${pratifalCounter}</p>
                <button class="btn btn-danger btn-sm" onclick="removePratifal(this)">
                    <i class="fas fa-trash"></i> हटाएं
                </button>
            </div>
            <div class="row">
                <div class="col-sm-6">
                    <div class="mb-5">
                        <label for="pratifalPrakar${pratifalCounter}" class="form-label">PRATIFAL KA PRAKAR</label>
                        <select class="form-select inputName" onchange="toggleFields(this)" required id="pratifalPrakar${pratifalCounter}" name="pratifal" aria-label="Default select example">
                            <option value="" hidden selected>Choose</option>
                            <option value="Cash">Cash</option>
                            <option value="Cheque">Cheque</option>
                            <option value="RTGS">RTGS</option>
                            <option value="NFTS">NFTS</option>
                            <option value="UPI">UPI</option>
                        </select>
                    </div>
                    <div class="mb-5">
                        <label for="jaariDinank${pratifalCounter}" class="form-label">JAARI DINANK</label>
                        <input type="date" required class="form-control inputName" id="jaariDinank${pratifalCounter}" name="pratifaldate">
                    </div>
                </div>
                <div class="col-sm-6">
                    <div id="checkr" class="mb-5">
                        <label for="checkr${pratifalCounter}" class="form-label">CHECK/RTGS NO/NFTS No/UPI Id</label>
                        <input type="text" required id="checkr${pratifalCounter}" name="check" class="form-control inputName">
                    </div>
                    <div class="mb-5">
                        <label for="rashi${pratifalCounter}" class="form-label">RASHI</label>
                        <input type="number" required id="rashi${pratifalCounter}" name="pratifalamount" class="form-control inputName">
                    </div>
                </div>
            </div>
            <div class=row>
                <div class="col-sm-6">
                    <div id="bank" class="mb-5">
                        <label for="bankNaam${pratifalCounter}" class="form-label">BANK KA NAAM</label>
                        <input type="text" required id="bankNaam${pratifalCounter}" name="pratifalbank" class="form-control inputName">
                    </div>
                </div>
            </div>
            
        `;

    const container = document.querySelector(".container");
    container.appendChild(newPratifal);
}

// Function to remove a PRATIFAL section
function removePratifal(button) {
    const pratifalSection = button.closest(".pratifal-section");
    if (pratifalCounter > 1) {
        pratifalSection.remove();
        pratifalCounter--;


        updatePratifalNumbersAndAttributes();
    }
}

// Function to update PRATIFAL numbers
function updatePratifalNumbersAndAttributes() {
    const pratifalSections = document.querySelectorAll(".pratifal-section");

    pratifalSections.forEach((section, index) => {
        const pratifalNumber = index + 2;
        section.querySelector("p").textContent = `PRATIFAL ${pratifalNumber}`;

        const inputs = section.querySelectorAll(".inputName");
        inputs.forEach((input) => {
            const originalName = input.getAttribute("id");
            const newName = originalName.replace(/\d+$/, pratifalNumber);
            input.setAttribute("id", newName);
        });

        const labels = section.querySelectorAll("label");
        labels.forEach((label) => {
            const originalFor = label.getAttribute("for");
            const newFor = originalFor.replace(/\d+$/, pratifalNumber);
            label.setAttribute("for", newFor);
        });
    });
}

function toggleFields(select) {
    const pratifalSection = select.closest(".pratifal-section");
    const selectedValue = select.value;
    const checkrField = pratifalSection.querySelector(`#checkr${pratifalCounter}`);
    const checkrLabel = pratifalSection.querySelector(`label[for=checkr${pratifalCounter}]`);
    const bankNaamField = pratifalSection.querySelector(`#bankNaam${pratifalCounter}`);
    const bankNaamLabel = pratifalSection.querySelector(`label[for=bankNaam${pratifalCounter}]`);

    if (selectedValue === "Cash") {
        checkrField.style.display = "none";
        checkrLabel.style.display = "none";
        bankNaamField.style.display = "none";
        bankNaamLabel.style.display = "none";
    } else {
        checkrField.style.display = "block";
        checkrLabel.style.display = "block";
        bankNaamField.style.display = "block";
        bankNaamLabel.style.display = "block";
    }
}
