
document.addEventListener('DOMContentLoaded', function () {
    const jilaDropdown = document.getElementById('jilaDropdown');
    const tehsilDropdown = document.getElementById('tehsilDropdown');
    const rajivDropdown = document.getElementById('rajivDropdown');
    const patwariDropdown = document.getElementById('patwariDropdown');
    const gaoDropdown = document.getElementById('gaoDropdown');
    const cityDropdown = document.getElementById('cityDropdown');
    const cityTypeDropdown = document.getElementById('cityTypeDropdown');

    function hideDropdowns(dropDowns) {
        dropDowns.forEach(function (dropdown) {
            dropdown.innerHTML = '<option value="">-- Select --</option>';
            dropdown.disabled = true;
            dropdown.required = false;
        });
    }

    function showDropdowns(dropDowns) {
        dropDowns.forEach(function (dropdown) {
            dropdown.disabled = false;
            dropdown.required = true;
        });
    }

    function populateDropdown(dropdown, data) {
        dropdown.innerHTML = '<option value="">-- Select --</option>';
        data.forEach(function (item) {
            const option = document.createElement('option');
            option.value = item.name;
            option.textContent = item.name;
            dropdown.appendChild(option);
        });
    }

    // Fetch Jila data
    fetch('/api/jila')
        .then(response => response.json())
        .then(data => {
            populateDropdown(jilaDropdown, data);
        })
        .catch(error => {
            console.error('Error fetching Jila data:', error);
        });

    // Jila dropdown change
    jilaDropdown.addEventListener('change', function () {
        const selectedJila = this.value;
        if (selectedJila) {
            // fetch Tehsil data based on selected Jila
            showDropdowns([tehsilDropdown]);
            // Show the Tehsil dropdown container
            document.getElementById('tehsilDropdownContainer').style.display = 'block';
            fetch(`/api/tehsil?jila=${selectedJila}`)
                .then(response => response.json())
                .then(data => {
                    tehsilDropdown.disabled = false;
                    populateDropdown(tehsilDropdown, data);
                })
                .catch(error => {
                    console.error('Error fetching Tehsil data:', error);
                });
                hideDropdowns([rajivDropdown, patwariDropdown, gaoDropdown, cityDropdown, cityTypeDropdown]);
        } else {
            hideDropdowns([tehsilDropdown, rajivDropdown, patwariDropdown, gaoDropdown, cityDropdown, cityTypeDropdown]);
        }
    });

    // Tehsil dropdown change
    tehsilDropdown.addEventListener('change', function () {
        const selectedTehsil = this.value;
        if (selectedTehsil) {
            // fetch Rajiv data based on selected Tehsil
            showDropdowns([rajivDropdown]);
            // Show the Rajiv dropdown container
            document.getElementById('rajivDropdownContainer').style.display = 'block';
            fetch(`/api/rajiv?tehsil=${selectedTehsil}`)
                .then(response => response.json())
                .then(data => {
                    populateDropdown(rajivDropdown, data);
                })
                .catch(error => {
                    console.error('Error fetching Rajiv data:', error);
                });
                hideDropdowns([patwariDropdown, gaoDropdown, cityDropdown, cityTypeDropdown]);
        } else {
            hideDropdowns([rajivDropdown, patwariDropdown, gaoDropdown, cityDropdown, cityTypeDropdown]);
        }
    });


// Rajiv dropdown change
rajivDropdown.addEventListener('change', function () {
    const selectedRajiv = this.value;
    if (selectedRajiv) {
        // fetch Patwari data based on selected Rajiv
        showDropdowns([patwariDropdown]);
        document.getElementById('patwariDropdownContainer').style.display = 'block';
        fetch(`/api/patwari?rajiv=${selectedRajiv}`)
            .then(response => response.json())
            .then(data => {
                populateDropdown(patwariDropdown, data);
            })
            .catch(error => {
                console.error('Error fetching Patwari data:', error);
            });

        // Disable and reset Gao, City, and City Type dropdowns
        hideDropdowns([gaoDropdown, cityDropdown, cityTypeDropdown]);
    } else {
        hideDropdowns([patwariDropdown, gaoDropdown, cityDropdown, cityTypeDropdown]);
    }
});


// Patwari dropdown change
patwariDropdown.addEventListener('change', function () {
    const selectedPatwari = this.value;
    if (selectedPatwari) {
        // fetch Gao data based on selected Patwari
        showDropdowns([gaoDropdown]);
        document.getElementById('gaoDropdownContainer').style.display = 'block';
        fetch(`/api/gao?patwari=${selectedPatwari}`)
            .then(response => response.json())
            .then(data => {
                populateDropdown(gaoDropdown, data);
            })
            .catch(error => {
                console.error('Error fetching Gao data:', error);
            });

        // Disable and reset City and City Type dropdowns
        hideDropdowns([cityDropdown, cityTypeDropdown]);
    } else {
        hideDropdowns([gaoDropdown, cityDropdown, cityTypeDropdown]);
    }
});


// Gao dropdown change
gaoDropdown.addEventListener('change', function () {
    const selectedGao = this.value;
    if (selectedGao) {
        // fetch City data based on selected Gao
        showDropdowns([cityDropdown]);
        document.getElementById('cityDropdownContainer').style.display = 'block';
        fetch(`/api/city?gao=${selectedGao}`)
            .then(response => response.json())
            .then(data => {
                populateDropdown(cityDropdown, data);
            })
            .catch(error => {
                console.error('Error fetching City data:', error);
            });

        // Disable and reset City Type dropdown
        hideDropdowns([cityTypeDropdown]);
    } else {
        // Reset and disable City and City Type dropdown
        hideDropdowns([cityDropdown, cityTypeDropdown]);
    }
});

// City dropdown change
cityDropdown.addEventListener('change', function () {
    const selectedCity = this.value;
    if (selectedCity) {
        // fetch City Type data based on selected City
        showDropdowns([cityTypeDropdown]);
        document.getElementById('cityTypeDropdownContainer').style.display = 'block';
        fetch(`/api/cityType?city=${selectedCity}`)
            .then(response => response.json())
            .then(data => {
                populateDropdown(cityTypeDropdown, data);
            })
            .catch(error => {
                console.error('Error fetching City Type data:', error);
            });
    } else {
        hideDropdowns([cityTypeDropdown]);
    }
});


    document.getElementById('sampatiVivran').addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission behavior
        
        // Get the form data
        const formData = {
            jila:  jilaDropdown.value,
            tehsil:  tehsilDropdown.vaue,
            rajiv:  rajivDropdown.value,
            patwari:  patwariDropdown.value,
            gao:  gaoDropdown.value,
            city:  cityDropdown.value,
            cityType:  cityTypeDropdown.value,
        }
        console.log(formData);

        // Send a POST request to the server
        fetch('/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the server response here
            console.log(data);
        })
        .catch(error => {
            // Handle any errors
            console.error('Error:', error);
        });
    });
});
