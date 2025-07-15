from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from .auth import bp as auth_bp
from .models import User, Prompt, Purchase

routes = Blueprint('routes', __name__)

@routes.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    return jsonify({'id': user.id, 'username': user.username, 'email': user.email, 'plan': user.plan})

@routes.route('/prompts', methods=['POST'])
@jwt_required()
def create_prompt():
    data = request.get_json()
    print("Received data:", data)  # Debug log
    user_id = get_jwt_identity()
    title = data.get('title')
    content = data.get('content')
    category = data.get('category')
    is_premium = data.get('isPremium', False)
    price = data.get('price', 0)

    if not title or not content:
        return jsonify({'msg': 'Title and content are required.'}), 400

    # Limit free users to 4 prompts
    from .models import User, Prompt
    user = User.query.get(user_id)
    if user.plan == 'free':
        prompt_count = Prompt.query.filter_by(user_id=user_id).count()
        if prompt_count >= 4:
            return jsonify({'msg': 'Free users can only create up to 4 prompts. Please upgrade to premium to create more.'}), 403

    prompt = Prompt(user_id=user_id, title=title, content=content, category=category, is_premium=is_premium, price=price)
    from .db import db
    db.session.add(prompt)
    db.session.commit()
    return jsonify({'message': 'Prompt created!', 'prompt_id': prompt.id}), 201

@routes.route('/prompts', methods=['GET'])
def get_prompts():
    from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        user_id = None
    prompts = Prompt.query.order_by(Prompt.created_at.desc()).all()
    result = []
    for prompt in prompts:
        # Hide content for premium prompts unless user is owner or has purchased
        show_content = True
        if prompt.is_premium:
            if not user_id or (str(prompt.user_id) != str(user_id)):
                from .models import Purchase
                purchase = Purchase.query.filter_by(user_id=user_id, prompt_id=prompt.id).first() if user_id else None
                if not purchase:
                    show_content = False
        result.append({
            'id': prompt.id,
            'user_id': prompt.user_id,
            'title': prompt.title,
            'content': prompt.content if show_content else None,
            'category': prompt.category,
            'is_premium': prompt.is_premium,
            'price': prompt.price,
            'created_at': prompt.created_at.isoformat(),
            'username': prompt.user.username if prompt.user else None
        })
    return jsonify(result)

@routes.route('/prompts/<int:prompt_id>', methods=['GET'])
def get_prompt(prompt_id):
    prompt = Prompt.query.get_or_404(prompt_id)
    # If the prompt is premium, check if the user is allowed to view the content
    if prompt.is_premium:
        user_id = None
        try:
            from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except Exception:
            pass
        # Only show content if user is owner or has purchased
        if not user_id or (str(prompt.user_id) != str(user_id)):
            from .models import Purchase
            purchase = Purchase.query.filter_by(user_id=user_id, prompt_id=prompt_id).first() if user_id else None
            if not purchase:
                return jsonify({
                    'id': prompt.id,
                    'user_id': prompt.user_id,
                    'title': prompt.title,
                    'content': None,  # Hide content
                    'category': prompt.category,
                    'is_premium': prompt.is_premium,
                    'price': prompt.price,
                    'created_at': prompt.created_at.isoformat(),
                    'username': prompt.user.username if prompt.user else None,
                    'msg': 'You must purchase this premium prompt to view the content.'
                })
    return jsonify({
        'id': prompt.id,
        'user_id': prompt.user_id,
        'title': prompt.title,
        'content': prompt.content,
        'category': prompt.category,
        'is_premium': prompt.is_premium,
        'price': prompt.price,
        'created_at': prompt.created_at.isoformat(),
        'username': prompt.user.username if prompt.user else None
    })

@routes.route('/prompts/<int:prompt_id>', methods=['PUT'])
@jwt_required()
def update_prompt(prompt_id):
    prompt = Prompt.query.get_or_404(prompt_id)
    user_id = get_jwt_identity()
    if str(prompt.user_id) != str(user_id):
        abort(403, description='Forbidden: You do not own this prompt.')
    data = request.get_json()
    prompt.title = data.get('title', prompt.title)
    prompt.content = data.get('content', prompt.content)
    prompt.category = data.get('category', prompt.category)
    prompt.is_premium = data.get('isPremium', prompt.is_premium)
    prompt.price = data.get('price', prompt.price)
    from .db import db
    db.session.commit()
    return jsonify({'message': 'Prompt updated successfully.'})

@routes.route('/prompts/<int:prompt_id>', methods=['DELETE'])
@jwt_required()
def delete_prompt(prompt_id):
    prompt = Prompt.query.get_or_404(prompt_id)
    user_id = get_jwt_identity()
    if str(prompt.user_id) != str(user_id):
        abort(403, description='Forbidden: You do not own this prompt.')
    from .db import db
    db.session.delete(prompt)
    db.session.commit()
    return jsonify({'message': 'Prompt deleted successfully.'})

@routes.route('/prompts/<int:prompt_id>/buy', methods=['POST'])
@jwt_required()
def buy_prompt(prompt_id):
    user_id = get_jwt_identity()
    prompt = Prompt.query.get_or_404(prompt_id)
    if not prompt.is_premium:
        return jsonify({'msg': 'This prompt is free.'}), 400
    existing = Purchase.query.filter_by(user_id=user_id, prompt_id=prompt_id).first()
    if existing:
        return jsonify({'msg': 'Already purchased.'}), 200
    purchase = Purchase(user_id=user_id, prompt_id=prompt_id)
    from .db import db
    db.session.add(purchase)
    db.session.commit()
    return jsonify({'msg': 'Prompt purchased successfully.'}), 201

@routes.route('/prompts/<int:prompt_id>/buy', methods=['GET'])
@jwt_required()
def check_purchase(prompt_id):
    user_id = get_jwt_identity()
    existing = Purchase.query.filter_by(user_id=user_id, prompt_id=prompt_id).first()
    return jsonify({'purchased': bool(existing)})

@routes.route('/ai-preview', methods=['POST'])
@jwt_required()
def ai_preview():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    prompt_id = data.get('prompt_id')
    prompt = Prompt.query.get(prompt_id)
    if prompt.is_premium and user.plan not in ['pro', 'enterprise']:
        return jsonify({'msg': 'Upgrade to Pro to use AI Preview on premium prompts.'}), 403
    # Here you would call your AI/gemini logic and return the result
    return jsonify({'msg': 'AI preview would be generated here.'}) 