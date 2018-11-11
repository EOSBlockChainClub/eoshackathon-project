import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchUser } from './actions/userActions';
import { setToken } from './actions/tokenActions';
import { playSong, stopSong, pauseSong, resumeSong } from './actions/songActions';
import './App.css';
import { Button, Divider, Form, Icon, Input,Image, Segment, Header, Message } from 'semantic-ui-react';
import logo from './logo.png';
// import Header from './components/Header';
import Footer from './components/Footer';
import UserPlaylists from './components/UserPlaylists';
import MainView from './components/MainView';
import ArtWork from './components/ArtWork';
import MainHeader from './components/MainHeader';
import SideMenu from './components/SideMenu';

class App extends Component {

	static audio;

	constructor(props){
		super(props);

		this.state = {
			showArtist: false,
			showUser: false,
			panelCSS: 'initialPanel'
		}
	}

	componentDidMount() {

	  // let hashParams = {};
	  // let e, r = /([^&;=]+)=?([^&;]*)/g,
	  //   q = window.location.hash.substring(1);
	  // while ( e = r.exec(q)) {
	  //   hashParams[e[1]] = decodeURIComponent(e[2]);
	  // }

	  // if(!hashParams.access_token) {
	  //   window.location.href = 'https://accounts.spotify.com/authorize?client_id=230be2f46909426b8b80cac36446b52a&scope=playlist-read-private%20playlist-read-collaborative%20playlist-modify-public%20user-read-recently-played%20playlist-modify-private%20ugc-image-upload%20user-follow-modify%20user-follow-read%20user-library-read%20user-library-modify%20user-read-private%20user-read-email%20user-top-read%20user-read-playback-state&response_type=token&redirect_uri=http://localhost:3000/callback';
	  // } else {
	  //   this.props.setToken(hashParams.access_token);
	  // }

	}

	componentWillReceiveProps(nextProps) {
	  if(nextProps.token) {
	    this.props.fetchUser(nextProps.token);
	  };

	  if(this.audio !== undefined) {
	    this.audio.volume = nextProps.volume / 100;
	  }

	}

	stopSong = () => {
	  if(this.audio) {
	    this.props.stopSong();
	    this.audio.pause();
	  }
	}

	pauseSong = () => {
	  if(this.audio) {
	    this.props.pauseSong();
	    this.audio.pause();
	  }
	}

	resumeSong = () => {
	  if(this.audio) {
	    this.props.resumeSong();
	    this.audio.play();
	  }
	}

	audioControl = (song) => {

	  const { playSong, stopSong } = this.props;
console.log('audioControl:',song);
	  if(this.audio === undefined){
	    playSong(song.track);
	    this.audio = new Audio(song.track.preview_url);
	    this.audio.play();
	  } else {
	    stopSong();
	    this.audio.pause();
	    playSong(song.track);
	    this.audio = new Audio(song.track.preview_url);
	    this.audio.play();
	  }
	}

	renderUser() {
		this.setState({
			showArtist: true,
			showUser: false,
			panelCSS: 'initialPanel-invisible'
		});
	}

	renderArtist() {
		this.setState({
			showArtist: false,
			showUser: true,
			panelCSS: 'initialPanel-invisible'
		});
	}

	render() {
	  return (
	    <div className='App'>
	      <div className='app-container'>
					<div className={this.state.panelCSS} > 
						<div class="button-panel" onClick={()=>this.renderArtist()}><p>Artist</p></div>
						<div class="button-panel" onClick={()=>this.renderUser()}><p>User</p></div>
					</div>
					{this.state.showUser == true ? 
						<div className='main-section'>
								<Segment basic clearing>
										<Header attached="top" color="black" block size="huge">
											Register as an Artist
											<Header.Subheader>
												Take control of your content
											</Header.Subheader>
										</Header>
									<Message content="Welcome to LSTN" warning  />
									<Form.Field
										label="Account Name"
										fluid="true"
										control={Input}
									/>
									
									<Form.Field
										label="Band Name"
										fluid="true"
										control={Input}
									/>
									<Divider />
									<Button
										content="Register"
										floated="right"
										onClick={()=>this.renderUser()}
									/>
								</Segment>
						</div> 
						: ''
						}
						{this.state.showArtist == true ? 
						<div>
							<div className='left-side-section'>
							<h2 className="app-name"><Image src={logo} /></h2>
								<UserPlaylists />
								<ArtWork />
							</div>

							<div className='main-section'>
								<div className='main-section-container'>
									<MainHeader
										pauseSong={ this.pauseSong }
										resumeSong={ this.resumeSong }
									/>
									<MainView
										pauseSong={this.pauseSong}
										resumeSong={ this.resumeSong }
										audioControl={ this.audioControl }
									/>
								</div>
							</div>
						</div>
						: ''
						}
						<div class="container">
					<div class="modal fade" id="myModal" role="dialog">
						<div class="modal-dialog">
							<div class="modal-content">
								<div class="modal-header">
              <button type="button" class="close" data-dismiss="modal">&times;</button>
              <h4 class="modal-title">Ed Silva</h4>
            </div>
            <div class="modal-body">
						<p>Account name: <strong>useraaaaaaaa</strong></p>
						<p>Sign up date: <strong>11/10/2018</strong></p>
						<p>Lifetime revenue share: <strong>24.1120 EOS</strong></p>
						<ul>
								<li>Queen - 15 VOTES</li>
								<li>Bag Raiders - 5 VOTES</li>
						</ul>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>	



						
	        <Footer
	          stopSong={ this.stopSong }
	          pauseSong={ this.pauseSong }
	          resumeSong={ this.resumeSong }
	          audioControl={ this.audioControl }
	        /> 
	      </div>
	    </div>
	  );
	}
}

App.propTypes = {
  token: PropTypes.string,
  fetchUser: PropTypes.func,
  setToken: PropTypes.func,
  pauseSong: PropTypes.func,
  playSong: PropTypes.func,
  stopSong: PropTypes.func,
  resumeSong: PropTypes.func,
  volume: PropTypes.number
};

const mapStateToProps = (state) => {

  return {
    token: state.tokenReducer.token,
    volume: state.soundReducer.volume
  };

};

const mapDispatchToProps = dispatch => {

  return bindActionCreators({
    fetchUser,
    setToken,
    playSong,
    stopSong,
    pauseSong,
    resumeSong
  },dispatch);

};

export default connect(mapStateToProps, mapDispatchToProps)(App);