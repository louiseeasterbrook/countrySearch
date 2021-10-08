const btn = document.querySelector(".btn-holder");
const textInput = document.getElementById("textBox");
const countryContainer = document.querySelector(".content-container");
const errorContainer = document.querySelector(".error");
const infoBtn = document.querySelector(".info");
const exitWelcome = document.querySelector(".crossHolder");
const load = document.querySelector(".load");

let previousInput = "";
let currentCount = 0;
let currentCountry = "";
let errorShow = false;

//____________________________________________________________________________

//if welcome cross is clicked
exitWelcome.addEventListener("click", () =>
  //remove welcome messgae
  document.querySelector(".welcome").classList.add("welcome-hide")
);

//if hover on info button, error message is removed
infoBtn.addEventListener("mouseover", () => errorRemove());

//if search button is pressed, country serach is triggered
btn.addEventListener("click", function () {
  inputEntered();
});

//if enter key is pressed, country search is triggered
document.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    inputEntered();
  }
});

// FUNCTIONS
//____________________________________________________________________________

//triggered when user enters search bar
const inputEntered = function () {
  //remove error
  errorRemove();

  //check if text input vlaue is null
  let currentSearch = textInput.value;
  if (!currentSearch) {
    //show message to prompt user to enter the input
    showError("Please Enter a County name");
    //check if searched country is already being shown
  } else if (
    currentSearch.toLowerCase() === currentCountry.toLowerCase() ||
    currentSearch.toLowerCase() === previousInput.toLowerCase()
  ) {
    showError("This country is currently being shown");
  } else {
    //call function to fetch country data
    findCountry(currentSearch);
    //clear text input
    textInput.value = "";
  }
};

//____________________________________________________________________________

// Get country data
const findCountry = async function (inputCountryName) {
  try {
    //obtain country data
    const data = await getJSON(
      `https://restcountries.com/v3.1/name/${inputCountryName}`
    );

    //remove welcome message on first search
    if (currentCount == 0) {
      document.querySelector(".welcome").classList.add("welcome-hide");
    }

    //save the value of the user text input
    currentCountry = data[0].name.common;
    previousInput = inputCountryName;

    //remove current country
    if (currentCount != 0) {
      removeCountry(currentCount);
    }
    loadToggle("out", "in");

    //get border value
    let border = "None";
    //check if borders exist
    if (data[0].borders) {
      if (data[0].borders.length > 0) {
        border = await getBorders(data[0].borders);
      }
    }

    //set name of first currency object name
    let currencyName;
    for (d in data[0].currencies) {
      currencyName = [d][0];
    }

    // add country data
    template(
      data[0].name.common,
      data[0].region,
      data[0].capital[0],
      populationRound(data[0].population),
      data[0].currencies[currencyName].name,
      data[0].currencies[currencyName].symbol,
      data[0].flags.svg,
      border
    );
  } catch (error) {
    showError(error);
  }
};

//____________________________________________________________________________

const getJSON = function (link, err = "Country does not exist") {
  return fetch(link).then((response) => {
    if (!response.ok) throw new Error(`${err}`);
    return response.json();
  });
};

//____________________________________________________________________________

//Error functions
showError = function (err) {
  errorShow = true;
  errorHtml = `<p class="errorTxt error-slide">${err}</p>`;
  errorContainer.insertAdjacentHTML("beforeend", errorHtml);
};

errorRemove = function () {
  let currentError = document.querySelector(".errorTxt");
  if (errorShow) {
    currentError.classList.add("error-out");
    setTimeout(() => currentError.remove(), 500);
    errorShow = false;
  }
};

loadToggle = function (remove, add) {
  load.classList.remove(`load-${remove}`);
  load.classList.add(`load-${add}`);
};

//____________________________________________________________________________

removeCountry = function (countryNum) {
  let thisCountry = document.getElementById(`country-${countryNum}`);
  //country fad out animation
  thisCountry.classList.add("fadeOut");
  //remove counrty from dom
  setTimeout(() => thisCountry.remove(), 500);
};

//____________________________________________________________________________
// round population number function

const populationRound = function (number) {
  let finalPopulation = "";
  numLength = number.toString().length;
  splitNumber = number.toString().substring(0, 3);

  roundNum = Math.round(splitNumber / 10);
  finalPopulation = roundNum.toString() + "0";

  remaining = numLength - 3;

  //add remain zeros
  while (remaining != 0) {
    finalPopulation += "0";
    remaining--;
  }

  //add commas to number
  return parseInt(finalPopulation).toLocaleString();
};

//____________________________________________________________________________

//function to build and append country info
const template = function (
  name = "-",
  continent = "-",
  capital = "-",
  population = "-",
  moneyName = "-",
  moneySymbol = "-",
  flag,
  border = "-"
) {
  currentCount++;
  const countryHtml = `
  <div class="slide-div slide" id="country-${currentCount}">
          <div class="sec-1 ">
            <img src="${flag}" class="flag-img" />
          </div>
          <div class="sec-2">
            <div class="country-container" ">
              <h3>${name}</h3>
              <div class="api-container">
                <p><strong>Continent:</strong> ${continent}</p>
                <p><strong>Capital City:</strong> ${capital}</p>
                <p><strong>Population:</strong> ${population}</p>
                <p><strong>Currency:</strong> ${moneyName} (${moneySymbol})</p>
                <p><strong>Bordering countries:</strong> ${border}</p>
              </div>
            </div>
          </div>
      </div>`;

  loadToggle("in", "out");
  //add html to page
  countryContainer.insertAdjacentHTML("afterbegin", countryHtml);
};

//____________________________________________________________________________

//get broders
const getBorders = async function (borderArray) {
  try {
    let borderList = [];
    for (let i = 0; i < borderArray.length; i++) {
      let data2 = await getJSON(
        `https://restcountries.com/v3.1/alpha/${borderArray[i]}`
      );
      //push all country name into the borderList array
      borderList.push(data2[0].name.common);
    }

    let borderString = "";
    for (let i = 0; i < borderList.length; i++) {
      //add country name to string
      borderString += ` ${borderList[i]}`;
      //if not the last county, add commato string
      if (i != borderList.length - 1) {
        borderString += ", ";
      }
    }
    return borderString;
  } catch (error) {
    console.error("borderList error");
  }
};
