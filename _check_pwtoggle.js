
function togglePw(id) {
  var el = document.getElementById(id);
  var btn = el.parentElement.querySelector('button');
  if (el.type === 'password') {
    el.type = 'text';
    if (btn) btn.textContent = '👁\u200D🗨';
  } else {
    el.type = 'password';
    if (btn) btn.textContent = '👁';
  }
}
