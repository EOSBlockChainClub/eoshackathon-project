/**
 * 
 * 
 * @team GoodBlock: Douglas Horn, Marlon Williams, Peter Bue, Ed Silva, Craig Branscom
 * @author Craig Branscom
 */

#include <eosiolib/eosio.hpp>
#include <eosiolib/types.h>
#include <eosiolib/asset.hpp>
#include <eosiolib/singleton.hpp>

using namespace eosio;
using namespace std;

class [[eosio::contract]] lstn : public contract {

public:

    using contract::contract;

    lstn(name self, name code, datastream<const char*> ds);
    
    ~lstn();

    struct [[eosio::table]] artist_info {
        name artist;
        string band_name;
        asset votes_received;
        
        uint64_t primary_key() const { return artist.value; }
        EOSLIB_SERIALIZE(artist_info, (artist)(band_name)(votes_received))
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
        //uint64_t song_id;
        string song_name;
        uint32_t plays;
        string ipfs_link;

        //uint64_t primary_key() const { return song_id; }
        //EOSLIB_SERIALIZE(song, (song_id)(song_name)(plays)(ipfs_link))
    };

    struct [[eosio::table]] album {
        uint64_t album_id;
        string album_name;
        string art_ipfs_url;
        name artist;
        vector<song> songs;
        uint32_t post_time;

        uint64_t primary_key() const { return album_id; }
        EOSLIB_SERIALIZE(album, (album_id)(album_name)(art_ipfs_url)(artist)(songs)(post_time))
    };

    struct [[eosio::table]] vote_receipt {
        uint64_t receipt_id;
        name artist;
        asset amount;
        uint32_t vote_time;

        uint64_t primary_key() const { return receipt_id; }
        EOSLIB_SERIALIZE(vote_receipt, (receipt_id)(artist)(amount)(vote_time))
    };

    struct [[eosio::table]] board {
        name publisher;

        name most_plays_artist;
        uint64_t most_plays_album_id;
        uint64_t most_plays_song_id;

        name most_requested_artist;

        uint64_t primary_key() const { return publisher.value; }
        EOSLIB_SERIALIZE(board, (publisher)
            (most_plays_artist)(most_plays_album_id)(most_plays_song_id)
            (most_requested_artist))
    };

    struct [[eosio::table]] pool {
        name publisher;

        asset most_plays_pool; 
        asset most_requested_artist_pool;

        uint32_t last_payout;

        uint64_t primary_key() const { return publisher.value; }
        EOSLIB_SERIALIZE(pool, (publisher)(most_plays_pool)(most_requested_artist_pool)(last_payout))
    };

    struct [[eosio::table]] payout {
        name artist;
        asset winnings;

        uint64_t primary_key() const { return artist.value; }
        EOSLIB_SERIALIZE(payout, (artist)(winnings))
    };

    typedef multi_index<name("artists"), artist_info> artists_table;

    typedef multi_index<name("listeners"), listener_info> listeners_table;

    typedef multi_index<name("songs"), song> songs_table; //NOTE: scoped by album_id

    typedef multi_index<name("albums"), album> albums_table; //NOTE: scoped by artist

    typedef multi_index<name("votereceipts"), vote_receipt> receipts_table;

    typedef multi_index<name("payouts"), payout> payouts_table;

    typedef singleton<name("boards"), board> leaderboards_table;
    leaderboards_table boards;
    board b;

    typedef singleton<name("pools"), pool> prize_pools;
    prize_pools pools;
    pool p;

    [[eosio::action]]
    void reglistener(name member);

    [[eosio::action]]
    void regartist(name member, string band_name);



    [[eosio::action]]
    void postalbum(name artist, string album_name);

    [[eosio::action]]
    void addsong(name artist, uint64_t album_id, string song_name, string ipfs_link);

    [[eosio::action]]
    void streamsong(uint64_t album_id, uint64_t song_id, name listener);

    [[eosio::action]]
    void subscribe(name listener);

    [[eosio::action]]
    void claimpayout(name artist);

    //Helper Functions

    void check_winner();

    [[eosio::action]]
    void vote(name artist, name voter);

};
