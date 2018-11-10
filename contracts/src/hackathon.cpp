/**
 * 
 * 
 * @team GoodBlock: Douglas Horn, Marlon Williams, Peter Bue, Ed Silva, Craig Branscom
 * @author Craig Branscom
 */

#include <hackathon.hpp>

class [[eosio::contract]] test : public contract {

public:

    uint64_t test;

    void postsong(name artist, string ipfs_link){
        require_auth(artist);

        //TODO: check for existing ipfs_link?

        songs_table songs(_self, _self.value);
        auto new_song_id = songs.available_primary_key();

        artists_table artists(_self, _self.value);
        auto art_itr = artists.find(artist.value);
        //eosio_assert(art_itr != artists.end(), "artist doesn't exist on the platform");

        statstable.emplace(_self, [&]( auto& l ) { //NOTE: payer may need to change
            l.song_id = new_song_id;
            l.artist = artist;
            l.ipfs_link = ipfs_link;
        });

    }

    void streamsong(uint64_t song_id, name listener) {
        require_auth(listener);

        songs_table songs(_self, _self.value);
        auto s_itr = songs.find(song_id);
        //eosio_assert(s_itr != songs.end(), "song doesn't exist on the platform");

        //TODO: pay tokens for listening
        //TODO: don't award for listening to own music

    }

};

EOSIO_DISPATCH(test, (postsong)(streamsong))