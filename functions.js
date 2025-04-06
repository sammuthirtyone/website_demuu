function timeElapse(date) {
    var current = new Date();
    var seconds = (Date.parse(current) - Date.parse(date)) / 1000;

    var days = Math.floor(seconds / (3600 * 24));
    seconds = seconds % (3600 * 24);

    var hours = Math.floor(seconds / 3600);
    if (hours < 10) {
        hours = "0" + hours;
    }

    seconds = seconds % 3600;
    var minutes = Math.floor(seconds / 60);
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    seconds = Math.floor(seconds % 60);
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    var result = "Days <span class=\"digit\">" + days + "</span> " +
        "Hours <span class=\"digit\">" + hours + "</span> " +
        "Minutes <span class=\"digit\">" + minutes + "</span> " +
        "Seconds <span class=\"digit\">" + seconds + "</span>";

    $("#clock").html(result);

    var text = "THE WORLD JUST GOT LUCKIER SINCE MARCH 31, 2007";
    $("#message-box").html(text);
}

// Call this every second to update live
setInterval(function () {
    timeElapse("2007-03-31T00:00:00");
}, 1000);
