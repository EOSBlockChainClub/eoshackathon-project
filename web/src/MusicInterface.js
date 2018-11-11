const {Api, JsonRpc, JsSignatureProvider} = require('eosjs');
const fetch = require('node-fetch');
const {TextDecoder, TextEncoder} = require('text-encoding');

class MusicInterface {

    constructor(keys, contractName, rpcConnectionString = 'http://127.0.0.1:8888') {
        if (!Array.isArray(keys)) {
            keys = [keys];
        }
        let signatureProvider = new JsSignatureProvider(keys);
        let rpc = new JsonRpc(rpcConnectionString, {fetch});
        this.contractName = contractName;
        this.api = new Api({rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()});
    }

    async initializeMockData() {
        let userAccounts = [
            "useraaaaaaaa",
            "useraaaaaaab",
            "useraaaaaaac",
            "useraaaaaaad",
            "useraaaaaaae",
            "useraaaaaaaf",
            "useraaaaaaag"
        ];


        //ADD listeners
        for (let i = 0; i < 3; i++) {
            await this.regListener(userAccounts[i]);
        }

        //add artists/albums/song
        await this.regArtist(userAccounts[3], "Queen");

        await this.postAlbum(userAccounts[3], "Jazz");
        let id = await this.getLastAlbumId(userAccounts[3]);
        console.log("Getting Jazz Album ID: ", id);
        await this.addSong(userAccounts[3], "Don't Stop Me Now", id, "Qmadjkfhadlkfhalsdkfj");

        await this.postAlbum(userAccounts[3], "News of the World");
        id = await this.getLastAlbumId(userAccounts[3]);
        console.log("Getting News of the World id: ", id);
        await this.addSong(userAccounts[3], "Bohemian Rhapsody", id, "Qmklsdfjasdhfjksadhflkhasd");

        await this.regArtist(userAccounts[4], "Modest Mouse");
        await this.postAlbum(userAccounts[4], "Good News for People Who Love Bad News");
        id = await this.getLastAlbumId(userAccounts[4]);
        console.log("getting Good News id: ", id);
        await this.addSongs(userAccounts[4], id, [
            { songName: "Float On", link: "Qmadsfjkhadsljkfhasljdkfh"},
            { songName: "Ocean Breathes Salty", link: "Qmadjkfhlakdhfkljshadf"},
            { songName: "The World at Large", link: "Qmdsakjfhaskdhflkasdjhfl"}
        ]);

        await this.regArtist(userAccounts[5], "Bag Raiders");
        await this.postAlbum(userAccounts[5], "Bag Raiders");
        id = await this.getLastAlbumId(userAccounts[5]);
        console.log("getting bag raider album id: ", id);
        await this.addSong(userAccounts[5], "Shooting Stars", id, "Qmfdajskhvjhbuyaef");
    }

    //TODO: configuration actions and finalization actions

    //TODO: regListener args: name
    async regListener(listenerName) {
        let action = {
            account: this.contractName,
            name: 'reglistener',
            authorization: [{actor: listenerName, permission: 'active'}],
            data: {member: listenerName}
        };

        return await this.send([action]);
    }

    //TODO: getListener
    async getListener(listenerName) {
        let response = await this.api.rpc.get_table_rows({
            code: this.contractName,
            scope: this.contractName,
            table: "listeners",
            table_key: listenerName
        });
        return response['rows'][0];
    }

    //TODO: regArtist args: name
    async regArtist(artistName, groupName) {
        let action = {
            account: this.contractName,
            name: 'regartist',
            authorization: [{actor: artistName, permission: 'active'}],
            data: {member: artistName, band_name: groupName}
        };

        return await this.send([action]);
    }

    //TODO: getArtist
    async getArtist(artistName) {
        let response = await this.api.rpc.get_table_rows({
            code: this.contractName,
            scope: this.contractName,
            table: "artists",
            table_key: artistName
        });
        return response['rows'][0];
    }

    async getAllArtist() {
        let response = await this.api.rpc.get_table_rows({
            code: this.contractName,
            scope: this.contractName,
            table: "artists"
        });
        return response['rows'];
    }

    //TODO: postAlbum args: name artist, string album_name, string song_name, string ipfs_link
    async postAlbum(artistName, albumName) {
        let action = {
            account: this.contractName,
            name: 'postalbum',
            authorization: [{actor: artistName, permission: 'active'}],
            data: {artist: artistName, album_name: albumName}
        };

        return await this.send([action]);
    }

    //TODO: getAlbums
    async getAlbums(artistName) {
        let response = await this.api.rpc.get_table_rows({code: this.contractName, scope: artistName, table: "albums"})
        return response['rows'];
    }

    //TODO: getLastAlbumId
    async getLastAlbumId(artistName) {
        let albums = await this.getAlbums(artistName);
        return await albums[albums.length - 1].album_id;
    }

    //TODO: getAlbum
    async getAlbum(artistName, id) {
        let response = await this.api.rpc.get_table_rows({
            code: this.contractName,
            scope: artistName,
            table: "albums",
            table_key: id
        });
        return await response['rows'][0];
    }

    //TODO: addSong args: name artist, uin64_t album_id, string ipfs_link
    async addSong(artistName, songName, albumId, link) {
        let action = this.createSongAction(artistName, songName, albumId, link);

        return await this.send([action]);
    }

    createSongAction(artistName, songName, albumId, link) {
        return {
            account: this.contractName,
            name: 'addsong',
            authorization: [{actor: artistName, permission: 'active'}],
            data: {artist: artistName, song_name: songName, album_id: albumId, ipfs_link: link}
        };
    }

    //TODO: BULK addsong
    async addSongs(artistName, albumId, songs) {
        let actions = [];
        songs.forEach((song) => {
            actions.push(this.createSongAction(artistName, song.songName, albumId, song.link))
        });
        return await this.send(actions);
    }

    // //TODO: getSongsFromAlbum
    // async getSongsFromAlbum(albumId) {
    //     let response = await this.api.rpc.get_table_rows({code: this.contractName, scope: albumId, table: "songs"});
    //     return response['rows'];
    // }

    // async getAllSongsFromArtist(artistName){
    //     let albums = await this.getAlbums(artistName);
    //     let album_songs = [];
    //
    //     for (let i = 0; i < albums.length; i++) {
    //         let albumsSongs = await this.getSongsFromAlbum(albums[i].album_id);
    //         album_songs.push({ album: albums[i], songs: albumsSongs });
    //     }
    //     return album_songs;
    // }

    //TODO: streamSong args: uint64_t song_id, name listener
    async streamSong(songId, listener) {
        let action = {
            account: this.contractName,
            name: "streamsong",
            authorization: {actor: listener, permission: "active"},
            data: {song_id: songId, listener: listener}
        };
        return await this.send([action]);
    }

    //TODO: vote changing...
    async vote() {

    }

    //TODO: subscribe args: name listener
    async subscribe(listener) {
        let action = {
            account: this.contractName,
            name: "subscribe",
            authorization: [{actor: listener, permission: "active"}],
            data: {listener: listener}
        };
        return await this.send([action]);
    }

    async send(actions) {
        return await this.api.transact({
            actions: actions,
        }, {blocksBehind: 3, expireSeconds: 30});
    }
}

// (async function (){
//
    let keys = [
        "5K7mtrinTFrVTduSxizUc5hjXJEtTjVTsqSHeBHes1Viep86FP5",
        "5KLqT1UFxVnKRWkjvhFur4sECrPhciuUqsYRihc1p9rxhXQMZBg",
        "5K2jun7wohStgiCDSDYjk3eteRH1KaxUQsZTEmTGPH4GS9vVFb7",
        "5KNm1BgaopP9n5NqJDo9rbr49zJFWJTMJheLoLM5b7gjdhqAwCx",
        "5KE2UNPCZX5QepKcLpLXVCLdAw7dBfJFJnuCHhXUf61hPRMtUZg",
        "5KaqYiQzKsXXXxVvrG8Q3ECZdQAj2hNcvCgGEubRvvq7CU3LySK",
        "5KFyaxQW8L6uXFB6wSgC44EsAbzC7ideyhhQ68tiYfdKQp69xKo"
    ];
//
//     let userAccounts = [
//         "useraaaaaaaa",
//         "useraaaaaaab",
//         "useraaaaaaac",
//         "useraaaaaaad",
//         "useraaaaaaae",
//         "useraaaaaaaf",
//         "useraaaaaaag"
//     ];
//
//     let contractName = "useraaaaaaag";
//     let interface = new MusicInterface(keys, contractName, "http://64.38.145.139:8888");
//     // try {
//     //     await interface.initializeMockData();
//     // } catch (e) {
//     //     console.log("Error initializing mock data: ", e);
//     // }
//
//     try {
//         let artist = await interface.getArtist(userAccounts[4]);
//         let albums = await interface.getAlbums(userAccounts[4]);
//
//         for (let i = 0; i < albums.length; i ++) {
//             console.log(albums[i]);
//         }
//
//     } catch(e) {
//         console.log(e);
//     }
//
// })();

const contractName = "useraaaaaaag";
const musicAPI = new MusicInterface(keys, contractName, "http://64.38.145.139:8888");

export default musicAPI;
