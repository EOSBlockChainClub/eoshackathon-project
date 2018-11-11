const {Api, Rpc, SignatureProvider} = require('eosjs');
const fetch = require('node-fetch');
const {TextDecoder, TextEncoder} = require('text-encoding');

class MusicInterface {

    constructor(keys, contractName, rpcConnectionString = 'http://127.0.0.1:8888') {
        if (!Array.isArray(keys)) {
            keys = [keys];
        }
        let signatureProvider = new SignatureProvider(keys);
        let rpc = new Rpc.JsonRpc(rpcConnectionString, {fetch});
        this.contractName = contractName;
        this.api = new Api({rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()});
    }

    //TODO: configuration actions and finalization actions

    //TODO: regListener args: name
    async regListener(listenerName) {
        let action = {
            account: this.contractName,
            name: 'reglistener',
            authorization: {actor: listenerName, permission: 'active'},
            data: {member: listenerName}
        }

        return await this.send(action);
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
    async regArtist(artistName) {
        let action = {
            account: this.contractName,
            name: 'regartist',
            authorization: {actor: artistName, permission: 'active'},
            data: {member: artistName}
        }

        return await this.send(action);
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

    //TODO: postAlbum args: name artist, string album_name, string song_name, string ipfs_link
    async postAlbum(artistName, albumName) {
        let action = {
            account: this.contractName,
            name: 'postalbum',
            authorization: {actor: artistName, permission: 'active'},
            data: {artist: artistName, album_name: albumName}
        }

        return await this.send(action);
    }

    //TODO: getAlbums
    async getAlbums(artistName) {
        let response = await this.api.rpc.get_table_rows({code: this.contractName, scope: artistName, table: "albums"})
        return response['rows'];
    }

    //TODO: getLastAlbumId
    async getLastAlbumId(artistName) {
        let albums = await this.getAlbums(artistName);
        return albums[albums.length - 1].artist;
    }

    //TODO: getAlbum
    async getAlbum(artistName, id) {
        let response = await this.api.rpc.get_table_rows({
            code: this.contractName,
            scope: artistName,
            table: "albums",
            table_key: id
        })
        return response['row'][0];
    }

    //TODO: addSong args: name artist, uin64_t album_id, string ipfs_link
    async addSong(artistName, songName, albumId, link) {
        let action = this.createSongAction(artistName, songName, albumId, link);

        return await this.send(action);
    }

    createSongAction(artistName, songName, albumId, link) {
        return {
            account: this.contractName,
            name: 'addsong',
            authorization: {actor: artistName, permission: 'active'},
            data: {artist: artistName, song_name: songName, album_id: albumId, ipfs_link: link}
        };
    }

    //TODO: BULK addsong
    async addSongs(artistName, albumId, songs) {
        let actions = []
        songs.forEach((song) => {
            actions.push(this.createSongAction(artistName, song.songName, albumId, song.link))
        });
        return await this.send(actions);
    }

    //TODO: getSongsFromAlbum
    async getSongsFromAlbum(albumId) {
        let respone = this.api.rpc.get_table_rows({code: this.contractName, scope: albumId, table: "songs"})
        return respone['rows'];
    }

    //TODO: streamSong args: uint64_t song_id, name listener
    async streamSong(songId, listener) {
        let action = {
            account: this.contractName,
            name: "streamsong",
            authorization: {actor: listener, permission: "active"},
            data: {song_id: songId, listener: listener}
        }
        return await this.send(action);
    }

    //TODO: vote changing...
    async vote() {

    }

    //TODO: subscribe args: name listener
    async subscribe(listener) {
        let action = {
            account: this.contractName,
            name: "subscribe",
            authorization: {actor: listener, permission: "active"},
            data: {listener: listener}
        }
        return await this.send(action);
    }

    async send(actions) {
        return await this.api.transact({
            actions: actions,
        }, {blocksBehind: 3, expireSeconds: 30});
    }
}

module.exports = {MusicInterface};