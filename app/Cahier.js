﻿

var enterSearchPosition = 0;
function Search(e) {

    var text = $("inputTabCahierSearch").value.toUpperCase();

    if (e.keyCode == 13) {
        var all = document.getElementsByClassName("divTabCahierResultEntry");
        for (var i = 0; i < all.length; i++) {
            if (typeof all[i].getElementsByTagName("img")[0] != "undefined") {
                var name = all[i].getElementsByClassName("spanTabCahierName")[0].innerHTML;
                var surname = all[i].getElementsByClassName("spanTabCahierSurname")[0].innerHTML;
                //var id = 
                chosePerson(name, surname);
            }
        }
    }
    else if (e.keyCode == 40 || e.keyCode == 38) {

    }
    else if (text != "") {
        Requests.getUsersList(text, 5);
        enterSearchPosition = 0;
    }
    else {
        $("divTabCahierSearchResult").innerHTML = "";
    }
}


function SearchDown(e) {
    if (e.keyCode == 40 || e.keyCode == 38) {
        if (e.keyCode == 40) {
            enterSearchPosition++;
        }
        else {
            enterSearchPosition--;
        }
        if (lastPeople != undefined) {

            for (var i = 0; i < lastPeople.length; i++) {

                var elem = document.getElementsByClassName("divTabCahierResultEntry")[i];

                elem.style.backgroundColor = "";
                if (typeof elem.getElementsByTagName("img")[0] != "undefined") {
                    elem.removeChild(elem.getElementsByTagName("img")[0]);
                }
                if (i == (enterSearchPosition % lastPeople.length + lastPeople.length) % lastPeople.length) {
                    var img = document.createElement("img");
                    img.id = "imgTabCahierSearchIconEnter";
                    img.src = "Img/IconEnter.png";
                    elem.appendChild(img);

                    elem.style.backgroundColor = "darkgray";
                }
            }

            //createSearchEntries(lastPeople);
        }
        e.preventDefault();
    }
}


var lastPeople;
function createSearchEntries(PeopleCorresponding) {

    lastPeople = PeopleCorresponding;

    $("divTabCahierSearchResult").innerHTML = "";

    var c = 0;

    if (PeopleCorresponding.length == 0) {
        var divResult = document.createElement("div");
        divResult.classList.add("divTabCahierResultEntry");
        $("divTabCahierSearchResult").appendChild(divResult);

        var span1 = document.createElement("span");
        span1.classList.add("spanTabCahierName");
        span1.innerHTML = "Aucun résultat :(";
        divResult.appendChild(span1);

        divResult.style.backgroundImage = "url('Img/IconNoResult.png')";
    }
    else {

        for (var i = 0; i < PeopleCorresponding.length; i++) {
            var divResult = document.createElement("div");
            divResult.id = PeopleCorresponding[i].id;
            divResult.classList.add("divTabCahierResultEntry");
            $("divTabCahierSearchResult").appendChild(divResult);

            divResult.addEventListener("mousedown", function () { chosePerson(this.getElementsByClassName("spanTabCahierName")[0].innerHTML, this.getElementsByClassName("spanTabCahierSurname")[0].innerHTML,this.id); });

            var span1 = document.createElement("span");
            span1.classList.add("spanTabCahierName");
            span1.innerHTML = PeopleCorresponding[i].name;
            divResult.appendChild(span1);

            var span2 = document.createElement("span");
            span2.classList.add("spanTabCahierSurname");
            span2.innerHTML = PeopleCorresponding[i].id;
            divResult.appendChild(span2);

            if (i == 0) {
                var img = document.createElement("img");
                img.id = "imgTabCahierSearchIconEnter";
                img.src = "Img/IconEnter.png";
                divResult.appendChild(img);

                divResult.style.backgroundColor = "darkgray";
            }

            if (PeopleCorresponding[i].name == "administrator") {
                divResult.style.backgroundImage = "url('Img/IconMan.png')";
            }
            else {
                divResult.style.backgroundImage = "url('Img/IconWoman.png')";
            }
        }
    }
}



function chosePerson(name, surname,id) {
    Cahier.personName = name;
    Cahier.personSurname = surname;
    Cahier.personId = id;
    newTab("divTabCahierMaterielCategories");
    $("divTabCahierInfosName").innerHTML = name + " " + surname;
}





function actualizeActualBookings(actualBookings,first) {

    var all = $('divTabCahierTableActualBookings').getElementsByClassName("TableEntries");
    for (var i = 0; i < all.length; i++) {
        if (all[i].id != "divTabCahierTableActualBookingsTopBar") {
            all[i].parentNode.removeChild(all[i]);
            i--;
        }
    }

    if (actualBookings.length == 0) {
        var entry = div($('divTabCahierTableActualBookings'));

        entry.classList.add("TableEntries");
        entry.classList.add("TableEntriesHover");

        var cell = div(entry);
    }

    if (first == true) {
        $('divTabCahierTableActualBookings').previousElementSibling.innerHTML += " (" + actualBookings.length + ")";
    }

    for (var i = 0; i < actualBookings.length; i++) {

        var container = div($('divTabCahierTableActualBookings'));

        container.id = actualBookings[i].id;
        container.classList.add("TableEntries");
        container.classList.add("TableEntriesHover");

        container.addEventListener("click", function (event) {
            if (event.target.classList.contains("Buttons")) {
                openFinishBooking(openPopUp(),this.id);
            }
            else if (typeof event.target.getElementsByTagName("div")[0] != "undefined") {
                if (event.target.getElementsByTagName("div")[0].classList.contains("Buttons")) {
                     openFinishBooking(openPopUp(), this.id);
                }
                else {
                    popBooking(this.id);
                }
            }
            else {
                popBooking(this.id);
            }         
        });

        div(container).innerHTML = (new Date(actualBookings[i].startDate)).getNiceTime(":", true);

        div(container).innerHTML = actualBookings[i].participantCount;

        div(container).innerHTML = getResponsibleNameFromBooking(actualBookings[i],true);

        if (actualBookings[i].bookables.length == 0) {
            div(container).innerHTML = "MP";
        }
        else {
            createBookingBookableBox(div(container), { code: actualBookings[i].bookables[0].code, name: actualBookings[i].bookables[0].name });
        }

        div(container).innerHTML = actualBookings[i].destination.shorten(150,20);

        div(container).innerHTML = getStartCommentFromBooking(actualBookings[i]).shorten(200, 20);

        var c = div(container);
        var btn = div(c);
        btn.classList.add("Buttons");
    }

    sortTable($('divTabCahierTableActualBookings'));
}

function createBookingBookableBox(elem, infos = { code: 9, name: "hello" }) {
    var d = elem;
    var cat = div(d);
    cat.id = "catégorie" + infos.code;
    var img = div(d);
    var code = div(d);
    code.innerHTML = infos.code;
    var name = div(d);
    name.innerHTML = infos.name.shorten(200, 18);
    d.classList.add("TableEntriesBookableBox");
}


function loadTableTopBars(allTables = document.getElementsByClassName("BookingsTable")) {

    for (var u = 0; u < allTables.length; u++) {

        var table = allTables[u];
        var top = table.getElementsByClassName("TableTopBar")[0];
        var all = top.getElementsByTagName("div");

        for (var i = 0; i < all.length; i = i + 2) {
            all[i].getElementsByTagName("div")[0].style.backgroundImage = "url(Img/IconSortASC.png)";

            all[i].addEventListener("click", function () {

                if (this.getElementsByTagName("div")[0].style.backgroundImage == 'url("Img/IconSortDESC.png")' || !(this.classList.contains("BookingsTopBarSorted"))) {
                    this.getElementsByTagName("div")[0].style.backgroundImage = "url(Img/IconSortASC.png)";
                    order = 1;
                }
                else {
                    this.getElementsByTagName("div")[0].style.backgroundImage = "url(Img/IconSortDESC.png)";
                    order = -1;

                }

                var allButtons = this.parentElement.getElementsByTagName("div");
                for (var k = 0; k < all.length; k = k + 2) {
                    if (allButtons[k] != this) {
                        allButtons[k].classList.remove("BookingsTopBarSorted");
                        allButtons[k].getElementsByTagName("div")[0].style.backgroundImage = "url(Img/IconSortASC.png)";
                    }
                }
                this.classList.add("BookingsTopBarSorted");

               sortTable(this.parentElement.parentElement);
            });
        }  
    }
}

function sortTable(table) {

    var field = parseInt(table.getElementsByClassName("BookingsTopBarSorted")[0].id);
    var order = function () {
        if (table.getElementsByClassName("BookingsTopBarSorted")[0].getElementsByTagName("div")[0].style.backgroundImage == 'url("Img/IconSortDESC.png")') {
            return -1;
        }
        else {
            return 1;
        }
    };

    console.log("table.id: " + table.id, "field: " + field, "order: " + order());

    var all = table.getElementsByClassName("TableEntries");
    var switching = true;
    while (switching) {
        switching = false;
        for (var i = 1; i < all.length - 1; i++) {
            if (all[i].children[field].innerHTML.toLowerCase() > all[i + 1].children[field].innerHTML.toLowerCase() && order() == 1 || all[i].children[field].innerHTML.toLowerCase() < all[i + 1].children[field].innerHTML.toLowerCase() && order() == -1) {
                all[i].parentElement.insertBefore(all[i + 1], all[i]);
                switching = true;
            }
        }
    }
}







function newBookingTable(date,title = "?") {
    if (title == "?"){title = date.getNiceDate();}
    Requests.getFinishedBookingListForDay(date, undefined,title,true);

    $('divTabCahierButtonMoreBookingsContainer').getElementsByTagName("div")[0].id = date.getPreviousDate();
    $('divTabCahierButtonMoreBookingsContainer').getElementsByTagName("div")[0].innerHTML = "Charger les sorties du " + date.getPreviousDate().getNiceDate(true);
}



function createBookingsTable(date,title) {

    var input = document.createElement("input");
    input.type = "text";
    input.value = "";
    input.spellcheck = "false";
    input.placeholder = "Rechercher";
    input.onkeyup = function () { Requests.getFinishedBookingListForDay(date, table, false); };
    $('divTabCahierTables').appendChild(input);

    var t = div($('divTabCahierTables'));
    t.classList.add("BookingsTableText");
    if (title == "?") {
        title = date.getNiceDate();
    }
    t.innerHTML = title;

    var table = div($('divTabCahierTables'));
    table.id = date.toISOString();
    table.classList.add("BookingsTable");

    var topBar = div(table);
    topBar.classList.add("TableEntries");
    topBar.classList.add("TableTopBar");

    var fields = ["Dép.", "Arr.", "Nbr", "Responsable", "Embarcation", "Destination", "Comm. de départ", "Comm. d'arrivée"];

    for (var i = 0; i < fields.length; i++) {
        var d = div(topBar);
        d.id = i;
        d.innerHTML = fields[i];
        div(d);
    }

    topBar.getElementsByTagName("div")[0].classList.add("BookingsTopBarSorted");

    var b = div(table);
    b.style.position = "absolute";
    b.style.width = "100%";
    b.style.height = "2px";
    b.style.backgroundColor = "gray";
    b.style.zIndex = "2";


    loadTableTopBars([table]);

    return table;
}

function createNoBookingMessage(date) {
    var t = div($('divTabCahierTables'));
    t.classList.add("BookingsTableTextNoBooking");    
    t.innerHTML = "Aucune sortie le "+ date.getNiceDate();
}

function actualizeFinishedBookingListForDay(bookings,table) {


    var all = table.getElementsByClassName("TableEntries");
    for (var i = 0; i < all.length; i++) {
        if (all[i].classList.contains("TableTopBar") == false) {
            all[i].parentNode.removeChild(all[i]);
            i--;
        }
    }


    if (bookings.length == 0) {
        var entry = div(table);

        entry.classList.add("TableEntries");
        entry.classList.add("TableEntriesHover");

        var cell = div(entry);
    }
    else {
        for (var i = 0; i < bookings.length; i++) {

            var entry = div(table);

            entry.id = bookings[i].id;
            entry.classList.add("TableEntries");
            entry.classList.add("TableEntriesHover");

            entry.addEventListener("click", function (event) {
                    popBooking(this.id);
            });

            div(entry).innerHTML = (new Date(bookings[i].startDate)).getNiceTime(":", true);
            div(entry).innerHTML = (new Date(bookings[i].endDate)).getNiceTime(":", true);

            div(entry).innerHTML = bookings[i].participantCount;

            div(entry).innerHTML = getResponsibleNameFromBooking(bookings[i],true);

            createBookingBookableBox(div(entry), { code: bookings[i].bookables[0].code, name: bookings[i].bookables[0].name });

            div(entry).innerHTML = bookings[i].destination.shorten(150, 20);
            div(entry).innerHTML = getStartCommentFromBooking(bookings[i]).startComment.shorten(200, 20);
            div(entry).innerHTML = getEndCommentFromBooking(bookings[i]).endComment.shorten(200, 20);

        }

        sortTable(table);
    }
}




