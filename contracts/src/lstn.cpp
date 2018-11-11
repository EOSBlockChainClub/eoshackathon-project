/**
 * 
 * 
 * @team GoodBlock: Douglas Horn, Marlon Williams, Peter Bue, Ed Silva, Craig Branscom
 * @author Craig Branscom
 */

#include "../include/hackathon.hpp"

void lstn::reglistener(name member) {
    require_auth(member);

    listeners_table listeners(_self, _self.value);
    auto new_listener = listeners.available_primary_key();

    listeners.emplace(_self, [&]( auto& l ) { //NOTE: payer may need to change
        l.listener = member;
        l.castable_votes = asset(0, symbol("VOTES", 0));
    });
}

void lstn::regartist(name member) {
    require_auth(member);

    artists_table artists(_self, _self.value);
    auto new_artist = artists.available_primary_key();

    artists.emplace(_self, [&]( auto& l ) { //NOTE: payer may need to change
        l.artist = member;
        l.votes_received = asset(0, symbol("VOTES", 0));
    });
}

void lstn::postalbum(name artist, string album_name) {
    require_auth(artist);

    albums_table albums(_self, artist.value);
    auto alb_itr = albums.available_primary_key();

    artists_table artists(_self, _self.value);
    auto art_itr = artists.find(artist.value);
    eosio_assert(art_itr != artists.end(), "artist doesn't exist on the platform");

    auto new_album_id = albums.available_primary_key();

    albums.emplace(_self, [&]( auto& l ) {
        l.album_id = new_album_id;
        l.album_name = album_name;
        l.artist = artist;
        l.post_time = now();
    });

}

void lstn::addsong(name artist, uint64_t album_id, string song_name, string ipfs_link) {
    require_auth(artist);

    artists_table artists(_self, _self.value);
    auto art_itr = artists.find(artist.value);
    eosio_assert(art_itr != artists.end(), "artist doesn't exist on the platform");

    albums_table albums(_self, artist.value);

    songs_table songs(_self, album_id);
    
    songs.emplace(_self, [&]( auto& l ) {
        l.song_id = songs.available_primary_key();
        l.song_name = song_name;
        l.ipfs_link = ipfs_link;
    });

}

void lstn::streamsong(uint64_t song_id, name listener) {
    require_auth(listener);

    songs_table songs(_self, _self.value);
    auto s_itr = songs.find(song_id);
    eosio_assert(s_itr != songs.end(), "song doesn't exist on the platform");

    //TODO: pay tokens for listening
    //TODO: don't award for listening to own music

    //NOTE: pay the artist 1 token

}

void lstn::subscribe(name listener) {
    require_auth(listener);

    listeners_table listeners(_self, _self.value);
    auto l_itr = listeners.find(listener.value);
    eosio_assert(l_itr != listeners.end(), "listener doesn't exist on platform");

    listeners.modify(l_itr, same_payer, [&]( auto& l ) {
        l.castable_votes = asset(10, symbol("VOTES", 0));
        l.end_subscribe = now() + uint32_t(5184000); //NOTE: ~1 month
    });
}

EOSIO_DISPATCH(lstn, (reglistener)(regartist)(postalbum)(streamsong)(subscribe))