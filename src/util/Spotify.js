let accessToken;
const clientID = "3203781ce83d4e3fbdd0a14e4ed896bc";
const redirectURI = "http://lioraferrero.surge.sh/";

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        //check for acces token match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);

            //now this clears the parameters, allowing us to grab a new access token when it expires.
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        }

        else {

            const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
            window.location = accessURL;

        }
    },

    async search(term) {

        const accessToken = Spotify.getAccessToken();

        const getRequest = await fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, 
                        {headers: {Authorization: `Bearer ${accessToken}`}});

        const responseJson = await getRequest.json();

        if (!responseJson.tracks) {

            return [];

        } else {

            const results = responseJson.tracks.items.map(track =>({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri}));

            return results;

        }

    },

    async savePlaylist(playlistName, URIarr) {

        if (playlistName && URIarr.length) {

            const accessToken = Spotify.getAccessToken();
            const headers = { Authorization: `Bearer ${accessToken}` };
            let userID; 

            const response = await fetch(`https://api.spotify.com/v1/me`, {headers: headers});
            const userName = await response.json();
            userID = userName.id;

            const playlistInfo = {
                                    headers: headers,
                                    method: 'POST',
                                    body: JSON.stringify({ name: playlistName }) 
            };

            const playlistRespond = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, playlistInfo);
            const playlistJson = await playlistRespond.json();
            const playlistID = playlistJson.id;

            const tracksInfo = {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ uris: URIarr }) };

            const tracksResponse = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, tracksInfo);
            return tracksResponse;
        }

    }
}

export default Spotify;