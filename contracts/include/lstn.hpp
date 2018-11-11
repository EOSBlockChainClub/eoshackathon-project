/**
 * 
 * 
 * @team GoodBlock: Douglas Horn, Marlon Williams, Peter Bue, Ed Silva, Craig Branscom
 * @author Craig Branscom
 */

#include <eosiolib/eosio.hpp>
#include <eosiolib/types.h>
#include <eosiolib/asset.hpp>

using namespace eosio;
using namespace std;

class [[eosio::contract]] lstn : public contract {

public:

    using contract::contract;

    //lstn() : contract();

    //TODO: global config

    //TODO: how to pay out artists for individual plays

    //TODO: calculate number of free songs

    struct [[eosio::table]] artist_info {
        name artist;
        asset votes_received;
        
        uint64_t primary_key() const { return artist.value; }
        EOSLIB_SERIALIZE(artist_info, (artist)(votes_received))
    };

    struct [[eosio::table]] listener_info {
        name listener;
        asset castable_votes;
        uint16_t free_plays;
        uint32_t last_recharge;
        uint32_t end_subscribe;

        uint64_t primary_key() const { return listener.value; }
        EOSLIB_SERIALIZE(listener_info, (listener)(castable_votes)(free_plays)(last_recharge)(end_subscribe))
    };

    struct [[eosio::table]] song {
        uint64_t song_id;
        string song_name;
        string ipfs_link;

        uint64_t primary_key() const { return song_id; }
        EOSLIB_SERIALIZE(song, (song_id)(song_name)(ipfs_link))
    };

    struct [[eosio::table]] album {
        uint64_t album_id;
        string album_name;
        //string art_ipfs_url; //TODO: 
        name artist;
        uint32_t post_time;

        uint64_t primary_key() const { return album_id; }
        EOSLIB_SERIALIZE(album, (album_id)(album_name)(artist)(post_time))
    };

    struct [[eosio::table]] vote_receipt {
        uint64_t receipt_id;
        name artist;
        asset amount;
        uint32_t vote_time;

        uint64_t primary_key() const { return receipt_id; }
        EOSLIB_SERIALIZE(vote_receipt, (receipt_id)(artist)(amount)(vote_time))
    };

    // struct [[eosio::table]] leaderboard {
    //     name board;
    //     asset num_votes;
    //     uint64_t reference;

    //     uint64_t primary_key() const { return board.value; }
    //     EOSLIB_SERIALIZE(leaderboard, (board)(num_votes)(reference))
    // };

    typedef multi_index<name("artists"), artist_info> artists_table;

    typedef multi_index<name("listeners"), listener_info> listeners_table;

    typedef multi_index<name("songs"), song> songs_table; //NOTE: scoped by album_id

    typedef multi_index<name("albums"), album> albums_table; //NOTE: scoped by artist

    typedef multi_index<name("votereceipts"), vote_receipt> receipts_table; 
    

    [[eosio::action]]
    void reglistener(name member);

    [[eosio::action]]
    void regartist(name member);



    [[eosio::action]]
    void postalbum(name artist, string album_name); //NOTE: maybe vector of strings?

    [[eosio::action]]
    void addsong(name artist, uint64_t album_id, string song_name, string ipfs_link);

    [[eosio::action]]
    void streamsong(uint64_t song_id, name listener);

    [[eosio::action]]
    void subscribe(name listener);

    // [[eosio::action]]
    // void vote(name board, asset num_votes, uint64_t recipient, name voter);

    //TODO: subscribe action, singleton for price pool
};
