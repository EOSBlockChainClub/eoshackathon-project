/**
 * 
 * 
 * @team GoodBlock: Douglas Horn, Marlon Williams, Peter Bue, Ed Silva, Craig Branscom
 * @author Craig Branscom
 */

#include <eosiolib/eosio.hpp>

using namespace eosio;
using namespace std;

class [[eosio::contract]] test : public contract {

public:

    using contract::contract;

    //test() : contract();

    struct [[eosio::table]] artist_info {
        name artist;
        //uint16_t published_songs;
        
        uint64_t primary_key() const { return artist.value; }
        EOSLIB_SERIALIZE(artist_info, (artist)))
    }

    struct [[eosio:table]] listener_info {
        name listener;
        //uint64_t last_song_played;
        //uint32_t last_play_time;

        uint64_t primary_key() const { return listener.value; }
        EOSLIB_SERIALIZE(listener_info, (listener)) 
    }

    struct [[eosio::table]] song {
        uint64_t song_id;
        name artist;
        string ipfs_link;

        uint64_t primary_key() const { return song_id; }
        //TODO: add secondary index by artist?
        EOSLIB_SERIALIZE(song, (song_id)(artist)(ipfs_link))
    };

    typedef multi_index<name("artists"), artist_info> artists_table;

    typedef multi_index<name("listeners"), listener_info> listeners_table;

    typedef multi_index<name("songs"), song> songs_table; 

    [[eosio::action]]
    void postsong(name artist, string ipfs_link);

    [[eosio::action]]
    void streamsong(uint64_t song_id, name listener);

};
