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
        name: 'Hipster',
        small: 'http://i.imgur.com/Sieqnpz.jpg',
        large: 'http://i.imgur.com/oKEfIyO.jpg'
    }
];

var getThemes = function(req, res) {
    res.json({success: true, themes: themes});
};

var functions = {
    getThemes: getThemes
};

module.exports = functions;
