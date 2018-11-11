/**
 * 
 * 
 * @team GoodBlock: Douglas Horn, Marlon Williams, Peter Bue, Ed Silva, Craig Branscom
 * @author Craig Branscom
 */

#include "../include/lstn.hpp"

lstn::lstn(name self, name code, datastream<const char*> ds) : contract(self, code, ds), pools(self, self.value), boards(self, self.value) {
    if (!pools.exists()) {

        p = pool{
            self, //publisher
            asset(0, symbol("EOS", 4)), //most_plays_pool
            asset(0, symbol("EOS", 4)), //most_requested_artist_pool
            now() //last_payout
        };

        pools.set(p, self);
    } else {
        p = pools.get();
    }

    if (!boards.exists()) {

        b = board{
            self //publisher
        };

        boards.set(b, self);
    } else {
        b = boards.get();
    }
}

lstn::~lstn() {
    if (pools.exists()) {
        pools.set(p, _self);
    }

    if (boards.exists()) {
        boards.set(b, _self);
    }

    check_winner();
}

void lstn::reglistener(name member) {
    require_auth(member);

    listeners_table listeners(_self, _self.value);
    auto new_listener = listeners.available_primary_key();

    listeners.emplace(_self, [&]( auto& l ) { //NOTE: payer may need to change
        l.listener = member;
        l.castable_votes = asset(0, symbol("VOTES", 0));
    });
}

void lstn::regartist(name member, string band_name) {
    require_auth(member);

    artists_table artists(_self, _self.value);
    auto new_artist = artists.available_primary_key();

    artists.emplace(_self, [&]( auto& l ) { //NOTE: payer may need to change
        l.artist = member;
        l.band_name = band_name;
        l.votes_received = asset(0, symbol("VOTES", 0));
    });
}

void lstn::postalbum(name artist, string album_name) {
    require_auth(artist);

    artists_table artists(_self, _self.value);
    auto art_itr = artists.find(artist.value);
    eosio_assert(art_itr != artists.end(), "artist doesn't exist on the platform");

    albums_table albums(_self, artist.value);
    auto alb_itr = albums.available_primary_key();

    auto new_album_id = albums.available_primary_key();

    vector<song> songs;

    albums.emplace(_self, [&]( auto& l ) {
        l.album_id = new_album_id;
        l.album_name = album_name;
        l.artist = artist;
        l.songs = songs;
        l.post_time = now();
    });

}

void lstn::addsong(name artist, uint64_t album_id, string song_name, string ipfs_link) {
    require_auth(artist);

    // artists_table artists(_self, _self.value);
    // auto art_itr = artists.find(artist.value);
    // eosio_assert(art_itr != artists.end(), "artist doesn't exist on the platform");

    albums_table albums(_self, artist.value);
    auto itr = albums.find(album_id);
    eosio_assert(itr != albums.end(), "album doesnt exist on platform");
    auto alb = *itr;

    //songs_table songs(_self, album_id);
    
    // songs.emplace(_self, [&]( auto& l ) {
    //     l.song_id = songs.available_primary_key();
    //     l.song_name = song_name;
    //     l.ipfs_link = ipfs_link;
    // });

    song new_song = song{
        song_name,
        0,
        ipfs_link
    };

    vector<song> new_songs = alb.songs;
    new_songs.push_back(new_song);

    albums.modify(itr, same_payer, [&]( auto& l ) {
        l.songs = new_songs;
    });

}

void lstn::streamsong(uint64_t album_id, uint64_t song_id, name listener) {
    require_auth(listener);

    // songs_table songs(_self, album_id);
    // auto s_itr = songs.find(song_id);
    // eosio_assert(s_itr != songs.end(), "song doesn't exist on the platform");
    // auto sng = *s_itr;

    listeners_table listeners(_self, _self.value);
    auto l_itr = listeners.find(listener.value);
    eosio_assert(l_itr != listeners.end(), "listener doesn't exist on platform");
    auto lstnr = *l_itr;

    eosio_assert(now() <= lstnr.end_subscribe, "subscription has ended");

    uint32_t new_recharge_time = lstnr.last_recharge;

    if (now() - lstnr.last_recharge >= uint32_t(17280)) { //over 1 day since last recharge
        uint32_t new_recharge_time = now();
    }

    eosio_assert(lstnr.free_plays >= uint16_t(1), "listener has no more free plays");

    uint16_t new_free_plays = lstnr.free_plays--;

    listeners.modify(l_itr, same_payer, [&]( auto& l ) {
        l.free_plays = new_free_plays;
        l.last_recharge = new_recharge_time;
    });

    // songs.modify(s_itr, same_payer, [&]( auto& l ) {
    //     l.plays += uint32_t(1);
    // });

    //update leaderboards

    // if (sng.song_id == b.most_plays_song_id) {
    //     return;
    // } else {
    //     songs_table leader(_self, b.most_plays_album_id);
    //     auto top_song = leader.get(b.most_plays_song_id);

    //     if (sng.plays > top_song.plays) {
    //         b.most_plays_song_id = sng.song_id;
    //         b.most_plays_album_id = album_id;
    //         //TODO: update artist
    //     }

    // }

    //TODO: don't award for listening to own music

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

    // //NOTE: 3.0000 EOS Payment
    // action(permission_level{ listener, name("active") }, name("eosio.token"), name("transfer"), make_tuple(
    // 	listener,
    //     _self,
    //     asset(int64_t(30000), symbol("EOS", 4)),
    //     std::string("Lstn Subscription Payment")
	// )).send();

    p.most_plays_pool += asset(10000, symbol("EOS", 4));
    p.most_requested_artist_pool += asset(10000, symbol("EOS", 4));

}

void lstn::claimpayout(name artist) {
    require_auth(artist);

    payouts_table payouts(_self, _self.value);
    auto itr = payouts.find(artist.value);
    eosio_assert(itr != payouts.end(), "no existing payout for artist");
    auto pay = *itr;

    //NOTE: 3.0000 EOS Payment
    action(permission_level{ artist, name("active") }, name("eosio.token"), name("transfer"), make_tuple(
    	_self,
        artist,
        pay.winnings,
        std::string("Artist Winnings Payment")
	)).send();

}

void lstn::vote(name artist, name voter) {
    require_auth(voter);

    artists_table artists(_self, _self.value);
    auto art_itr = artists.find(artist.value);
    eosio_assert(art_itr != artists.end(), "artist doesn't exist on the platform");
    auto art = *art_itr;

    listeners_table listeners(_self, _self.value);
    auto l_itr = listeners.find(voter.value);
    eosio_assert(l_itr != listeners.end(), "listener doesn't exist on platform");
    auto lstnr = *l_itr;

    asset new_votes = lstnr.castable_votes - asset(1, symbol("VOTES", 0));

    asset new_total = art.votes_received + asset(1, symbol("VOTES", 0));

    listeners.modify(l_itr, same_payer, [&]( auto& l ) {
        l.castable_votes = new_votes;
    });

    artists.modify(art_itr, same_payer, [&]( auto& l ) {
        l.votes_received = new_total;
    });

    receipts_table receipts(_self, artist.value);
    auto itr = receipts.find(artist.value);

    if (itr != receipts.end()) {
        receipts.modify(itr, same_payer, [&]( auto& l ) {
             l.amount = asset(1, symbol("VOTES", 0));
             l.vote_time = now();
        });
    } else {
        receipts.emplace(_self, [&]( auto& l ) {
            l.artist = artist;
            l.amount = asset(1, symbol("VOTES", 0));
            l.vote_time = now();
        });
    }
    

}

//Helper Functions

void lstn::check_winner() {
    if (now() - p.last_payout >= uint32_t(1209600)) { //NOTE: ~1 week

        payouts_table playspay(_self, _self.value);
        
        playspay.emplace(_self, [&]( auto& l ) { //NOTE: payer may need to change
            l.artist = b.most_plays_artist;
            l.winnings = p.most_plays_pool;
        });

        payouts_table reqpay(_self, _self.value);

        reqpay.emplace(_self, [&]( auto& l ) { //NOTE: payer may need to change
            l.artist = b.most_requested_artist;
            l.winnings = p.most_requested_artist_pool;
        });
    }
}

EOSIO_DISPATCH(lstn, (reglistener)(regartist)(postalbum)(addsong)(streamsong)(subscribe)(claimpayout)(vote))
