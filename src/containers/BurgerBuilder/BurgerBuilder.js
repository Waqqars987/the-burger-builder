import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../axios-orders';
import Aux from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../store/actions/index';

const burgerBuilder = props => {
	const [ purchasing, setPurchasing ] = useState(false);

	/* Alternative to connect()() */
	const ings = useSelector(state => state.burgerBuilder.ingredients);
	const price = useSelector(state => state.burgerBuilder.totalPrice);
	const error = useSelector(state => state.burgerBuilder.error);
	const isAuthenticated = useSelector(state => state.auth.token !== null);

	const dispatch = useDispatch();
	const onIngredientAdded = ingName => dispatch(actions.addIngredient(ingName));
	const onIngredientRemoved = ingName => dispatch(actions.removeIngredient(ingName));
	// onInitIngredients() changes with every render which causes infinite loop, hence it is cached with useCallback()
	const onInitIngredients = useCallback(() => dispatch(actions.initIngredients()), [ dispatch ]);
	const onInitPurchase = () => dispatch(actions.purchaseInit());
	const onSetAuthRedirectPath = path => dispatch(actions.setAuthRedirectPath(path));
	/**********************************************************************************************************************/

	useEffect(
		() => {
			onInitIngredients();
		},
		[ onInitIngredients ]
	);

	const updatePurchaseState = updatedIngredients => {
		const sum = Object.keys(updatedIngredients)
			.map(igKey => {
				return updatedIngredients[igKey];
			})
			.reduce((sum, el) => {
				return sum + el;
			}, 0);
		return sum > 0;
	};

	const purchaseHandler = () => {
		if (isAuthenticated) {
			setPurchasing(true);
		} else {
			onSetAuthRedirectPath('/checkout');
			props.history.push('/auth');
		}
	};

	const purchaseCancelHandler = () => {
		setPurchasing(false);
	};

	const purchaseContinueHandler = () => {
		onInitPurchase();
		props.history.push('/checkout');
	};

	const disabledInfo = {
		...ings
	};
	for (let key in disabledInfo) {
		disabledInfo[key] = disabledInfo[key] <= 0;
	}
	let orderSummary = null;
	let burger = error ? <h1 style={{ textAlign: 'center' }}>Ingredients cannot be loaded!</h1> : <Spinner />;
	if (ings) {
		burger = (
			<Aux>
				<Burger ingredients={ings} />
				<BuildControls
					ingredientAdded={onIngredientAdded}
					ingredientRemoved={onIngredientRemoved}
					price={price}
					disabled={disabledInfo}
					purchaseable={updatePurchaseState(ings)}
					ordered={purchaseHandler}
					isAuth={isAuthenticated}
				/>
			</Aux>
		);

		orderSummary = (
			<OrderSummary
				ingredients={ings}
				price={price}
				purchaseCanceled={purchaseCancelHandler}
				purchaseContinued={purchaseContinueHandler}
			/>
		);
	}
	return (
		<Aux>
			<Modal show={purchasing} modalClosed={purchaseCancelHandler}>
				{orderSummary}
			</Modal>
			{burger}
		</Aux>
	);
};

export default withErrorHandler(burgerBuilder, axios);
