const socket = io.connect('');

let form = $('#room form');
let input = $('#room input');
let ul = $('#room ul');

socket
    .on('message', function (username, message) {
        printMessage(username + ': ' + message);
    })
    .on('leave', function (username) {
        printStatus(username + ' left the chat...');
    })
    .on('join', function (username) {
        printStatus(username + ' join to the chat...');
    })
    .on('connect', function () {
        printStatus('Connected...');
        form.on('submit', sendMessage);
        input.prop('disabled', false);
    })
    .on('disconnect', function () {
        printStatus('Disconnected...');
        form.off('submit', sendMessage);
        input.prop('disabled', true);
    })
    .on('logout', function () {
        location.href = '/login';
    })
    .on('error', function (reason) {
        printStatus(reason);
    });

function sendMessage() {
    let text = input.val();
    socket.emit('message', text, function () {
        printMessage('My message: ' + text);
    });
    input.val('');
    return false;
}

function printMessage(message) {
    $('<li>').text(message).appendTo(ul);
}

function printStatus(status) {
    $('<li>').append($('<i>').text(status)).appendTo(ul);
}
