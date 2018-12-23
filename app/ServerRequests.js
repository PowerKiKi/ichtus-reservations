var Server;
function ServerInitialize() {
    // Get the API
    Server = window.ichtusApi;
    console.warn('Server(API) = ', Server);

  //  Requests.getItemList();

   // getCountries();
 //  Requests.createQuery();
   // Requests.addBookable();

 //   Requests.personalQuery();$

   // Requests.addBookable("Planche 1", "une magnifique planche qui flotte dot�e d'une d�rive pour ne pas d�river");
}


var bookingsResult = [];

var Requests = {

    // login
    login: function (pwd) {
        alert("ok");
        Server.userService.login({
            login: 'administrator',
            password: pwd
        }).subscribe(result => {
            console.log(result);
            alert("logged");
        });
    },


    // getUsersList FOR CAHIER.JS
    getUsersList: function (text = "") {
        var filter = {
            filter: {
                groups: [
                    { conditions: [{ name: { like: { value: '%' + text + '%' } } }] }
                ]
            },
            pagination: {
                pageSize: 5,
                pageIndex: 0
            },
            sorting: [{
                field: 'name',
                order: 'ASC'
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.userService.getAll(variables).subscribe(result => {
            console.log("getUsersList(): ", result);
            createSearchEntries(result.items);
        });
    },

    // getBookablesList
    getBookablesList: function () {

        var order;
        if ($('divTabCahierMaterielElementsSelectIconSort').style.backgroundImage == 'url("Img/IconSortDESC.png")') {
            order = "DESC";
        }
        else {
            order = "ASC";
        }

        var whichField = $('divTabCahierMaterielElementsSelectSort').getElementsByTagName("select")[0].value;

        var txt = $('inputTabCahierMaterielElementsInputSearch').value;

        var categorie = $('divTabCahierMaterielElementsSelectCategorie').getElementsByTagName("select")[0].value;
        if (categorie == "all") { categorie = ""; }

        //alert(categorie);

        var f = {
            filter: {
                groups: [
                    {
                        groupLogic: 'AND',
                        conditionsLogic: 'OR',
                        conditions: [
                            {
                                name: {
                                    like: {
                                        value: "%" + txt + "%"
                                    }
                                }
                            },
                            { //enlever dans le futur
                                id: {
                                    like: {
                                        value: "%" + txt + "%"
                                    }
                                }
                            },
                            {
                                code: {
                                    like: {
                                        value: "%" + txt + "%"
                                    }
                                }
                            },
                            {
                                custom: {
                                    search: {
                                        value: "%" + txt + "%"
                                    }
                                }
                            }
                        ]
                    },
                    {       //CATEGORIES...
                        groupLogic: 'AND',
                        conditionsLogic: 'AND',
                        conditions: [
                            {
                                bookingType: {
                                    like: {
                                        value: "self_approved"
                                    }
                                }
                            }
                        ],
                        joins: {
                            type: {
                                conditions: [{
                                    name: {
                                        like: {
                                            value: "%" + categorie
                                        }
                                    }
                                }]
                            }
                        }

                    }
                ]
            },
            sorting: [
                { field: whichField, order: order }
            ],
            pagination: {
                pageSize: parseInt($('divTabCahierMaterielElementsSelectPageSize').getElementsByTagName('select')[0].value),
                pageIndex: 0
            }
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', f);

        Server.bookableService.getAll(variables).subscribe(result => {
            console.log("getBookablesList(): ", result);
            loadElements(result.items);
        });
    },

    // getBookableInfos
    getBookableInfos: function (bookableId,elem) {

        var filter = {
            filter: {
                groups: [
                    { conditions: [{ id: { like: { value: bookableId } } }] }
                ]
            },
            pagination: {
                pageSize: 1,
                pageIndex: 0
            },
            sorting: [{
                field: "id", //USELESS
                order: "ASC" //USELESS
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookableService.getAll(variables).subscribe(result => {
            console.log("getBookableInfos(): ", result);
            actualizePopBookable(result.items,elem);
        });
    },


    // Add an item
    addBookable: function (_name, _description) {

        const item = { name: "1", description: "kj", bookingType: "self_approved", type: 6004 };

        Server.bookableService.create(item).subscribe(result => {
            console.log('Bookable created', result);
        });

    },


    getActualBookingList: function () {

        bookingsResult = [];

        var filter = {
            filter: {
                groups: [                   
                    {
                        groupLogic:"AND",
                        conditions: [{
                                status: {
                                    equal: {
                                        value: "booked"
                                    }
                                }
                            },
                            {
                                endDate: {
                                    null: {
                                        not:false
                                    }
                                }
                            }
                        ]
                    },
                    {
                        groupLogic: "AND",
                        joins: {
                            bookables: {
                                conditions: [{
                                    bookingType: {
                                        equal: {
                                            value: "self_approved"
                                        }
                                    }
                                }]
                            }
                        }
                    }
                    
                ]
            },
            pagination: {
                pageSize: 20,
                pageIndex: 0
            },
            sorting: [
                {
                    field: "id",
                    order: "ASC"
                }
            ]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            console.log("getActualBookingList(): ", result);
            this.showBooking(0, result.items);
        });

    },

    showBooking: function (i, bookings) {

        if (bookings[i].bookables == undefined) {
            actualizeActualBookings(bookings[i], { name: "", id: "", code: "---" });
            if (i < bookings.length - 1) {
                bookingsResult.push({ name: "--", id: "--", code: "--" });
                i++;
                this.showBooking(i, bookings);
            }
        }
        else {
            var filter = {
                filter: {
                    groups: [
                        { conditions: [{ id: { like: { value: bookings[i].bookables[0].id } } }] }
                    ]
                },
                pagination: {
                    pageSize: 1,
                    pageIndex: 0
                }
            };

            var variables = new Server.QueryVariablesManager();
            variables.set('variables', filter);

            Server.bookableService.getAll(variables).subscribe(resultBookable => {
                console.log("getBookingList_getBookableInfos(): " + i, resultBookable.items);

                //actualizeActualBookings(bookings[i], resultBookable.items[0]);
                bookingsResult.push(resultBookable.items[0]);

                if (i < bookings.length - 1) {
                    i++;
                    this.showBooking(i, bookings);
                }
                else {
                    actualizeActualBookings2(bookings, bookingsResult);
                }
            });
        }
    },

    // getBookingsListForBookable
    getBookingsListForBookable: function (bookableId, elem) {

        var filter = {
            filter: {
                groups: [
                    {
                        joins: {
                            bookables: {
                                conditions: [{
                                    id: {
                                        like: {
                                            value: bookableId
                                        }
                                    }
                                }]
                            }
                        }
                    }
                ]
            },
            pagination: {
                pageSize: 10,
                pageIndex: 0
            },
            sorting: [{
                field: "id", //USELESS
                order: "ASC" //USELESS
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            console.log("getBookingsListForBookable(): ", result);
            actualizePopBookingsList(result.items, elem);
        });
    },

    getBookableHistory: function (bookableId, elem) {
        var filter = {
            filter: {
                groups: [
                    {
                        joins: {
                            bookables: {
                                conditions: [{
                                    id: {
                                        like: {
                                            value: bookableId
                                        }
                                    }
                                }]
                            }
                        }
                    }
                ]
            },
            pagination: {
                pageSize: 10,
                pageIndex: 0
            },
            sorting: [{
                field: "startDate", 
                order: "DESC" 
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            console.log("getgetBookableHistory(): ", result);
            actualizePopBookableHistory(result.items, elem);
        });
    },

    getBookingsNbrBetween: function (start,end,bookableId = "%",elem=document.body,writeIfOne = true) {
        var filter = {
            filter: {
                groups: [
                    {
                        joins: {
                            bookables: {
                                conditions: [{
                                    id: {
                                        equal: {
                                            value: bookableId
                                        }
                                    }
                                }]
                            }
                        }
                    },
                    {    
                    conditions: [{
                        startDate: {
                            between: {
                                from: start,
                                to:end
                            }
                        }
                    }]                                               
                    }
                ]
            },
            pagination: {
                pageSize: 0,
                pageIndex: 0
            }
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            console.log("getBookingsNbrBetween(): ", result.length + " sorties", result);
            if (result.length != 1 || writeIfOne == true) {
             //   elem.innerHTML += " (" + result.length + ")";
                elem.innerHTML += result.length;
            }     
            else {
                elem.parentElement.parentElement.removeChild(elem.parentElement);
            }
        });
    },

    // getBookingInfos
    getBookingInfos: function (bookingId, elem) {

        var filter = {
            filter: {
                groups: [
                    { conditions: [{ id: { like: { value: bookingId } } }] }
                ]
            },
            pagination: {
                pageSize: 1,
                pageIndex: 0
            },
            sorting: [{
                field: "id", //USELESS
                order: "ASC" //USELESS
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            console.log("getBookingInfos(): ", result);
            actualizePopBooking(result.items[0], elem);
        });
    },

    getBookingFinishInfos: function (bookingId, elem) {

        var filter = {
            filter: {
                groups: [
                    { conditions: [{ id: { like: { value: bookingId } } }] }
                ]
            },
            pagination: {
                pageSize: 1,
                pageIndex: 0
            },
            sorting: [{
                field: "id", //USELESS
                order: "ASC" //USELESS
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            console.log("getBookingFinishInfos(): ", result);
            actualizePopBookingFinish(result.items[0],elem);
        });
    },

    updateBooking: function (bookingId, input= { endComment: "A"}) {

        alert(input.endComment);

    },

    // createBooking
    createBooking: function () {

        // Get all items
        Server.bookingService.create({

            participantCount: Cahier.nbrAccompagnants,
            destination: Cahier.destination,
            startComment: Cahier.startComment,
            responsible: {id:Cahier.personId,name:Cahier.personName}

        }).subscribe(booking => {

            console.log('Created booking : ', booking);

            // LINK BOOKABLE
            Server.linkMutation.link(booking, {
                id: Cahier.bookableId,
                __typename: 'Bookable'
            }).subscribe(() => {
                console.log('Linked Bookable : ', booking);
                Requests.getActualBookingList();
            });

            // LINK RESPONSIBLE
      //      Server.linkMutation.link(booking, {
           //     id: Cahier.personId,
        //        __typename: 'Responsible'
        //    }).subscribe(() => {
        //        console.log('Linked Responsible : ', booking);
       //     });

        });

    },


    // personalQuery
    personalQuery: function () {

        var TheQuery = Server.gql`
        {
              bookables(
                filter:{
      
                  groups:[{
        
                    conditionsLogic:OR
        
        
                    conditions:[
                      {
                        id:{
                          like:{
                            value:"%3001%"
                          }
                        }
                        name:{
                          like:{
                            value:"%R15%"
                          }
                        }
                      }
                    ]}
        
        
        
                  ]
      
                },
                sorting: [{
    	            field:id
                  order:DESC
                }]
              )
              {
                  items {
                    id
                    name
                    description
        
                    tags {
                      id
                    }

                  }
                }
            }
            `;

        Server.apollo.query({ query: TheQuery }).subscribe(result => {
            console.log("Result of Requests.createQuery(): ", result);
        });
    }








};
