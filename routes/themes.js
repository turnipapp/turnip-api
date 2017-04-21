var themes = [
    {
        id: 0,
        name: 'Summer',
        small: 'http://i.imgur.com/C0A59M4.jpg',
        large: 'http://i.imgur.com/FWG5rjl.jpg'
    },
    {
        id: 1,
        name: 'Night',
        small: 'http://i.imgur.com/HwnhxRf.jpg',
        large: 'http://i.imgur.com/pCv2Buz.jpg'
    },
    {
        id: 2,
        name: 'BBQ',
        small: 'http://i.imgur.com/aEW2S2Q.jpg',
        large: 'http://i.imgur.com/slUPyUY.jpg'
    },
    {
        id: 3,
        name: 'Cole',
        small: 'http://i.imgur.com/Sieqnpz.jpg',
        large: 'http://i.imgur.com/oKEfIyO.jpg'
    },
    {
        id: 4,
        name: 'Graduation',
        small: 'http://i.imgur.com/K36bN8x.jpg',
        large: 'http://i.imgur.com/2Xkofib.jpg',
    },
    {
        id: 5,
        name: 'July 4th',
        small: 'http://i.imgur.com/s97zseN.jpg',
        large: 'http://i.imgur.com/CZyR22m.jpg'
    },
    {
        id: 6,
        name: 'Dad',
        small: 'http://i.imgur.com/QwMg6bZ.jpg',
        large: 'http://i.imgur.com/QwMg6bZ.jpg'
    },
    {
        id: 7,
        name: 'Birthday',
        small: 'http://i.imgur.com/lwG2rYG.jpg',
        large: 'http://i.imgur.com/lwG2rYG.jpg'
    },
    {
        id: 8,
        name: 'Road Trip',
        small: 'http://i.imgur.com/6YR6CXK.jpg',
        large: 'http://i.imgur.com/6YR6CXK.jpg'
    }
];

var getAll = function(req, res) {
    res.json({success: true, themes: themes});
};

var getOne = function(req, res) {
    var theme = themes[req.params.id];
    res.json({success: true, theme: theme});
};

var functions = {
    getAll: getAll,
    getOne: getOne
};

module.exports = functions;
