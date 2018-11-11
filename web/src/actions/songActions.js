import {uniqBy, forEach} from 'lodash/uniqBy';
import { setArtistIds } from './artistActions';
import musicAPI from '../MusicInterface';

export const fetchSongsPending = () => {
  return {
    type: 'FETCH_SONGS_PENDING'
  };
};

export const fetchSongsSuccess = (songs) => {
  return {
    type: 'FETCH_SONGS_SUCCESS',
    songs
  };
};

export const fetchSongsError = () => {
  return {
    type: 'FETCH_SONGS_ERROR'
  };
};

export const fetchSongs = (accessToken) => {
  return dispatch => {
    const request = new Request(`https://api.spotify.com/v1/me/tracks?limit=50`, {
      headers: new Headers({
        'Authorization': 'Bearer ' + accessToken
      })
    });

    dispatch(fetchSongsPending());

    fetch(request).then(res => {
      if(res.statusText === "Unauthorized") {
        window.location.href = './';
      }
      return res.json();
    }).then(res => {
      // get all artist ids and remove duplicates
      let artistIds = uniqBy(res.items, (item) => {
        return item.track.artists[0].name;
      }).map(item => {
        return item.track.artists[0].id;
      }).join(',');

      dispatch(setArtistIds(artistIds));

      dispatch(fetchSongsSuccess(res.items));
    }).catch(err => {
      dispatch(fetchSongsError(err));
    });
  };
};

export const searchSongsPending = () => {
  return {
    type: 'SEARCH_SONGS_PENDING'
  };
};

export const searchSongsSuccess = (songs) => {
  return {
    type: 'SEARCH_SONGS_SUCCESS',
    songs
  };
};

export const searchSongsError = () => {
  return {
    type: 'SEARCH_SONGS_ERROR'
  };
};

export const searchSongs = (searchTerm, accessToken) => {
  return dispatch => {

    dispatch(searchSongsPending());

    let songs = [];

    musicAPI.getAllArtist().then(res => {
      res.forEach( (artist) => {
        if (searchTerm != '' && artist.band_name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)
        {
          musicAPI.getAlbums(artist.artist).then( albums => {
            albums.forEach( (album) => {
              const artistSongs = album.songs
              .map((data) => {
                const {
                  song_name,
                  plays,
                  ipfs_link
                } = data;
                return {
                  added_at: Date.now(),
                  track: {
                    id: Math.random(),
                    name: song_name,
                    title: song_name,
                    plays: plays,
                    stream_url: ipfs_link,
                    preview_url: ipfs_link,
                    artists:[{
                      name: album.artist,
                      band_name: artist.band_name,
                      votes_received: artist.votes_received
                    }],
                    album: {
                      id: album.album_id,
                      name: album.album_name,
                      images:[
                        {
                          url:''
                        }
                      ]
                    }
                  }
                };
              });
              artistSongs.forEach( (song) => {
                songs.push(song);
              });
            });
            dispatch(searchSongsSuccess(songs));
          });
        }
      });      
    }).catch(err => {
      dispatch(fetchSongsError(err));
    });
  };
};

export const fetchRecentlyPlayedPending = () => {
  return {
    type: 'FETCH_RECENTLY_PLAYED_PENDING'
  };
};

export const fetchRecentlyPlayedSuccess = (songs) => {
  return {
    type: 'FETCH_RECENTLY_PLAYED_SUCCESS',
    songs
  };
};

export const fetchRecentlyPlayedError = () => {
  return {
    type: 'FETCH_RECENTLY_PLAYED_ERROR'
  };
};

export const fetchRecentlyPlayed = (accessToken) => {
  return dispatch => {
    
    dispatch(fetchRecentlyPlayedPending());

    
  };
};

export const playSong = (song) => {
  return {
    type: 'PLAY_SONG',
    song
  };
};

export const stopSong = () => {
  return {
    type: 'STOP_SONG'
  };
};

export const pauseSong = () => {
  return {
    type: 'PAUSE_SONG'
  };
};

export const resumeSong = () => {
  return {
    type: 'RESUME_SONG'
  };
};

export const increaseSongTime = (time) => {
  return {
    type: 'INCREASE_SONG_TIME',
    time
  };
};

export const updateViewType = (view) => {
  return {
    type: 'UPDATE_VIEW_TYPE',
    view
  };
};
