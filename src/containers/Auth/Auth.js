import React, { Component } from 'react';
import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import classes from './Auth.css';
import * as actions from '../../store/actions/index';
import { connect } from 'react-redux';
import Spinner from '../../components/UI/Spinner/Spinner';
import { Redirect } from 'react-router-dom';
import { updateObject, checkValidity } from '../../shared/utility';

class Auth extends Component {
	state = {
		controls : {
			email    : {
				elementType   : 'input',
				elementConfig : {
					type        : 'email',
					placeholder : 'Enter Your Email'
				},
				value         : '',
				validation    : {
					required : true,
					isEmail  : true
				},
				valid         : false,
				touched       : false,
				errorMessage  : 'Please enter a valid Email!'
			},
			password : {
				elementType   : 'input',
				elementConfig : {
					type        : 'password',
					placeholder : 'Enter Your Password'
				},
				value         : '',
				validation    : {
					required  : true,
					minLength : 6
				},
				valid         : false,
				touched       : false,
				errorMessage  : 'Please enter a valid Password!'
			}
		},
		isSingup : true
	};

	componentDidMount () {
		if (!this.props.buildingBurger && this.props.authRedirectPath !== '/') {
			this.props.onSetAuthRedirectPath();
		}
	}

	inputChangedHandler = (event, controlName) => {
		const updatedControls = updateObject(this.state.controls, {
			[controlName] : updateObject(this.state.controls[controlName], {
				value   : event.target.value,
				valid   : checkValidity(event.target.value, this.state.controls[controlName].validation),
				touched : true
			})
		});
		this.setState({ controls: updatedControls });
	};

	submitHandler = (event) => {
		event.preventDefault();
		this.props.onAuth(this.state.controls.email.value, this.state.controls.password.value, this.state.isSingup);
	};

	switchAuthModeHandler = () => {
		this.setState((prevState) => {
			return { isSingup: !prevState.isSingup };
		});
	};

	render () {
		const formElementsArray = [];
		for (let key in this.state.controls) {
			formElementsArray.push({
				id     : key,
				config : this.state.controls[key]
			});
		}
		let form = formElementsArray.map((formElement) => {
			return (
				<Input
					key={formElement.id}
					elementType={formElement.config.elementType}
					elementConfig={formElement.config.elementConfig}
					value={formElement.config.value}
					invalid={!formElement.config.valid}
					shouldValidate={formElement.config.validation}
					touched={formElement.config.touched}
					changed={(event) => {
						this.inputChangedHandler(event, formElement.id);
					}}
					errorMessage={formElement.config.errorMessage}
				/>
			);
		});

		if (this.props.loading) {
			form = <Spinner />;
		}

		let errorMessage = null;
		if (this.props.error) {
			errorMessage = <p style={{ color: 'red', fontWeight: 'bold' }}>{this.props.error.message}</p>;
		}

		let authRedirect = null;
		if (this.props.isAuthenticated) {
			authRedirect = <Redirect to={this.props.authRedirectPath} />;
		}
		return (
			<div className={classes.Auth}>
				{authRedirect}
				{errorMessage}
				<form onSubmit={this.submitHandler}>
					{form}
					<Button btnType='Success'>{this.state.isSingup ? 'SIGNUP' : 'SIGNIN'}</Button>
				</form>
				<Button btnType='Danger' clicked={this.switchAuthModeHandler}>
					SWITCH TO {this.state.isSingup ? 'SIGNIN' : 'SIGNUP'}
				</Button>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onAuth                : (email, password, isSingup) => dispatch(actions.auth(email, password, isSingup)),
		onSetAuthRedirectPath : () => dispatch(actions.setAuthRedirectPath('/'))
	};
};

const mapStateToProps = (state) => {
	return {
		loading          : state.auth.loading,
		error            : state.auth.error,
		isAuthenticated  : state.auth.token !== null,
		buildingBurger   : state.burgerBuilder.building,
		authRedirectPath : state.auth.authRedirectPath
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
