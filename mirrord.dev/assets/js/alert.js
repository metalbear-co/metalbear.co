function closeAlert() {
  let announcement = document.getElementById('announcement');
  if (announcement) {
    announcement.style.display = 'none';
  }
}
var isAlertDismissed = localStorage.getItem('alertDismissed');
if (isAlertDismissed) {
  closeAlert();
}

function dismissAlert() {
  closeAlert();
  localStorage.setItem('alertDismissed', 'true');
}
