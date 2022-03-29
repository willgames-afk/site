out = document.getElementById('localhost?')
if (location.port) {
    console.log('Locally Hosted!')
    out.innerHTML = 'Locally Hosted on Port ' + location.port + '!'
} else if (location.hostname == 'willgames.io') {
    out.innerHTML = 'Online and hosted at willgames.io'
}