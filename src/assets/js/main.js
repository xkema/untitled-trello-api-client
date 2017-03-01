// console.log('hola lola!');

// get page elements
let btnAuthorize = document.getElementById('utc-btn-authorize'),
    tableHolder = document.getElementById('utc-table'),
    btnReport = document.getElementById('utc-btn-create-report'),
    reportTextHolder = document.getElementById('utc-report-text'),
    btnAddMeeting = document.getElementById('utc-btn-add-meeting');

// promise objects
let $a, // auth
    $u, // user
    $c; // cards

// init
const initUtcApp = () => {
  // bind auth button listener
  $a = btnAuthorize.addEventListener('click', (event) => {
    UtcUtils.authorizeUserToApp(event).then(readyUtcApp, badThingsHappen);
  });
  // silent auth at startup
  $a = UtcUtils.authorizeUserToApp().then(readyUtcApp, badThingsHappen);
  // report button handlers
  btnReport.addEventListener('click', () => {
    let reportStatus = UtcUtils.createSimpleReport(collectCheckedCardReportStrings());
    if(false === reportStatus) {
      reportTextHolder.innerHTML = 'Nothing to report..';
    } else {
      reportTextHolder.innerHTML = reportStatus;      
    }
  });
  // add meeting button handlers
  btnAddMeeting.addEventListener('click', () => {
    if(-1 === reportTextHolder.innerHTML.search('Toplanti')) {
      if('Nothing to report..' === reportTextHolder.innerHTML || '' === reportTextHolder.innerHTML) {
        reportTextHolder.innerHTML = 'Toplanti';
      } else {
        reportTextHolder.innerHTML += ', Toplanti';
      }
    }
  });
}

// app authorized
const readyUtcApp = () => {
  // enable button, show loading info
  btnAuthorize.classList.add('utc-hidden');
  tableHolder.innerHTML = 'updating table data..';
  // fetch user data
  $u = UtcUtils.getMe();
  $u.then((value) => {
    let userId = value.id;
    $c = UtcUtils.getCardsOfList('581c53dac5f591ba7be90d2c');
    // fetch cards of list data
    $c.then((value) => {
      // user cards only
      let userCardsOnly = UtcUtils.filterCardsOfuser(value, userId)
      // sort cards by idShort
      UtcUtils.sortCardsByIdShort(userCardsOnly);
      // prepare cards table
      tableHolder.innerHTML = UtcUtils.renderCardsTable(userCardsOnly);
      // bind listeners to table elements
      bindTableListeners();
    }, badThingsHappen);
  }, badThingsHappen);
}

// error handler for all
const badThingsHappen = (...args) => {
  if('undefined' === typeof args[0]) {
    console.log('ERROR GENERIC :: something bad happened, authorization failure maybe?');
    btnAuthorize.classList.remove('utc-hidden');    
  } else {
    console.log(`ERROR :: status: ${args[0].status}, details: ${args[0].responseText}`);
  }
}

// bind table listeners
const bindTableListeners = () => {
  // checkbox toggler
  document.getElementById('utc-data-table').addEventListener('click', (e) => { 
    if('td' === e.target.nodeName.toLowerCase()) {
      let checkbox = e.target.parentElement.firstElementChild.firstElementChild;
      checkbox.checked = !checkbox.checked;
    }
  });
}

// collect checkboxes clicked
const collectCheckedCardReportStrings = () => {
  let checkboxes = Array.prototype.slice.call(tableHolder.querySelectorAll('input'));
  return checkboxes.filter((checkbox) => {
    return checkbox.checked;
  }).map((input) => {
    return input.dataset.reportString;
  });
}

// bind listeners
document.addEventListener('DOMContentLoaded', initUtcApp);
