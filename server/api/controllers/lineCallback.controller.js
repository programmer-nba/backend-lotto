const querystring = require('querystring');

exports.lineLoginCallBack = (req, res) => {
    try {
        const data = req.query;
        const queryString = querystring.stringify(data);
        res.redirect(process.env.CALLBACK_URL + '/login?' + queryString);
    } catch (err) {
        console.error(err);
        res.redirect(process.env.CALLBACK_URL + '/login');
    }
};

exports.lineRegisterCallBack = (req, res) => {
    try {
        const data = req.query;
        const queryString = querystring.stringify(data);
        res.redirect(process.env.CALLBACK_URL + '/register?' + queryString);
    } catch (err) {
        console.error(err);
        res.redirect(process.env.CALLBACK_URL + '/register');
    }
};

exports.lineUpdateProfileCallBack = (req, res) => {
    try {
        const data = req.query;
        const queryString = querystring.stringify(data);
        res.redirect(process.env.CALLBACK_URL + '/seller/profile?' + queryString);
    } catch (err) {
        console.error(err);
        res.redirect(process.env.CALLBACK_URL + '/seller/profile');
    }
};
