const querystring = require('querystring');
const axios = require('axios');
const crypto = require('crypto');
const Client = require("../models/user/client_model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const CLIENT_ID = '2006270685';
const CLIENT_SECRET = 'dbe7d3107e3145ed671ae98b8772f6b3';
const REDIRECT_URI = 'http://localhost:5555/lotto/api/v1/line-callback';

const sessions = [];

exports.lineLogin = (req, res) => {
    const state = crypto.randomBytes(16).toString('hex'); // Generate a secure random state
    sessions.push(state); // Store the state in the session
    console.log('Session state set:', req.session.state);
    const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?` + querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        state: state, // Use the state stored in the session
        scope: 'profile openid email',
    });

    res.status(200).json({
        status: 'success',
        url: lineLoginUrl
    });
};

exports.lineCallBack = async (req, res) => {
    const { code, state } = req.query;
    //console.log('Session state on callback:', req.session.state);
    // Compare the state in the session with the one from the query
    if (!sessions.includes(state)) {
        return res.status(400).send('Invalid state');
    }

    try {
        const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', querystring.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token } = tokenResponse.data;

        // Use the access token to get the user profile
        const profileResponse = await axios.get('https://api.line.me/v2/profile', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        sessions.splice(sessions.indexOf(state), 1);

        const body = {
            displayName: profileResponse.data.displayName,
            lineId: profileResponse.data.userId,
            linePicture: profileResponse.data.pictureUrl
        }
        const existClient = await Client.findOne({lineId: body.lineId})
        if (!existClient) {
            const createProfile = await createClient(body)
            if (!createProfile) {
                return res.status(500).send('Create profile failed.')
            }
        }

        const user = await Client.findOne({lineId: body.lineId})

        if (!user) {
            return res.status(404).send('User not found.')
        }

        if (!user.active) {
            return res.status(401).json({ message: "ผู้ใช้งานไม่ได้รับการอนุมัติให้เข้าระบบ กรุณาติดต่อแอดมิน", invalid: 'active' })
        }

        const token = jwt.sign(
            {
                _id: user._id, 
                displayName: user.displayName,
                role: user.role
            }, 
            "Lotto$5555"
        )

        return res.redirect(`http://localhost:8080/linecallback?token=${token}&displayName=${body.displayName}&lineId=${body.lineId}&linePicture=${body.linePicture}`)

        //res.json(profileResponse.data);
    } catch (error) {
        console.error('Error during LINE login:', error.message);
        res.status(500).send('Login failed.');
    }
};

const createClient = async (body) => {
    const {
        displayName,
        lineId,
        linePicture
    } = body
    try {
        if (!displayName || !lineId) {
            return false
        }

        const hashedPassword = await bcrypt.hash(lineId, 12)

        const userLength = await Client.countDocuments()
        const padCode = (userLength + 1).toString().padStart(4, '0')
        const userCodePrefix = 'LT-'

        const code = `${userCodePrefix}${padCode}`

        const newClient = new Client({
            code: code,
            username: lineId,
            password: hashedPassword,
            displayName: displayName,
            lineId: lineId,
            firstName: crypto.randomBytes(16).toString('hex'),
            lastName: crypto.randomBytes(16).toString('hex'),
            linePicture: linePicture
        })

        await newClient.save()
        return true

    }
    catch (err) {
        console.log(err)
        return false
    }
}
