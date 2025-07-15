import os
from dotenv import load_dotenv
import stripe
from flask import Blueprint, request, jsonify

load_dotenv()
stripe.api_key = os.environ.get("STRIPE_API_KEY")

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    data = request.json
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card', 'upi'],  # Enable UPI
            line_items=[{
                'price_data': {
                    'currency': 'inr',  # UPI requires INR
                    'product_data': {
                        'name': data['prompt_title'],
                    },
                    'unit_amount': int(float(data['price']) * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=data['success_url'],
            cancel_url=data['cancel_url'],
            metadata={
                'user_id': data['user_id'],
                'prompt_id': data['prompt_id'],
            }
        )
        return jsonify({'id': session.id})
    except Exception as e:
        return jsonify(error=str(e)), 400 