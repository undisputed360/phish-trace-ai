import re
from urllib.parse import urlparse
import tldextract

# Install this if missing: pip install tldextract
# We'll add it to requirements in a moment

def extract_features(url):
    """
    Extract features from a URL for phishing detection.
    Returns a dictionary of features.
    """
    features = {}
    
    # Parse URL
    parsed = urlparse(url)
    extracted = tldextract.extract(url)
    
    domain = extracted.domain
    suffix = extracted.suffix
    full_domain = f"{domain}.{suffix}" if suffix else domain
    
    # 1. URL Length
    features['url_length'] = len(url)
    
    # 2. Number of dots in URL
    features['dot_count'] = url.count('.')
    
    # 3. Number of hyphens in domain
    features['hyphen_count'] = url.count('-')
    
    # 4. Number of underscores in URL
    features['underscore_count'] = url.count('_')
    
    # 5. Number of slashes in path
    features['slash_count'] = url.count('/')
    
    # 6. Number of question marks
    features['question_count'] = url.count('?')
    
    # 7. Number of equal signs
    features['equal_count'] = url.count('=')
    
    # 8. Number of @ symbols (used for redirects)
    features['at_count'] = url.count('@')
    
    # 9. Number of & symbols
    features['ampersand_count'] = url.count('&')
    
    # 10. Number of % symbols (encoding)
    features['percent_count'] = url.count('%')
    
    # 11. Number of digits in URL
    features['digit_count'] = sum(c.isdigit() for c in url)
    
    # 12. Number of letters in URL
    features['letter_count'] = sum(c.isalpha() for c in url)
    
    # 13. Uses HTTPS (1 = yes, 0 = no)
    features['uses_https'] = 1 if parsed.scheme == 'https' else 0
    
    # 14. Has IP address as domain
    ip_pattern = r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$'
    features['has_ip'] = 1 if re.match(ip_pattern, parsed.netloc.split(':')[0]) else 0
    
    # 15. Domain length
    features['domain_length'] = len(full_domain) if full_domain else 0
    
    # 16. Number of subdomains
    subdomain = extracted.subdomain
    features['subdomain_count'] = len(subdomain.split('.')) if subdomain else 0
    
    # 17. Path length
    features['path_length'] = len(parsed.path)
    
    # 18. Has suspicious TLD (free/cheap TLDs often used in phishing)
    suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club', '.work', '.date']
    features['suspicious_tld'] = 1 if any(url.lower().endswith(tld) for tld in suspicious_tlds) else 0
    
    # 19. Ratio of digits to letters (phishing URLs often have more digits)
    if features['letter_count'] > 0:
        features['digit_letter_ratio'] = features['digit_count'] / features['letter_count']
    else:
        features['digit_letter_ratio'] = 0
    
    # 20. Contains suspicious keywords
    suspicious_keywords = ['login', 'signin', 'verify', 'secure', 'account', 'update', 
                           'confirm', 'banking', 'password', 'billing', 'suspended']
    features['suspicious_keywords'] = sum(1 for kw in suspicious_keywords if kw in url.lower())
    
    # 21. URL entropy (measure of randomness — high entropy is suspicious)
    features['url_entropy'] = calculate_entropy(url)
    
    return features


def calculate_entropy(text):
    """Calculate Shannon entropy of a string."""
    import math
    if not text:
        return 0
    
    entropy = 0
    for c in set(text):
        p = text.count(c) / len(text)
        entropy -= p * math.log2(p)
    
    return entropy


def extract_features_as_list(url):
    """
    Extract features and return as ordered list (for model prediction).
    Must match the order used during training.
    """
    features = extract_features(url)
    
    # Return in consistent order
    feature_order = [
        'url_length', 'dot_count', 'hyphen_count', 'underscore_count',
        'slash_count', 'question_count', 'equal_count', 'at_count',
        'ampersand_count', 'percent_count', 'digit_count', 'letter_count',
        'uses_https', 'has_ip', 'domain_length', 'subdomain_count',
        'path_length', 'suspicious_tld', 'digit_letter_ratio',
        'suspicious_keywords', 'url_entropy'
    ]
    
    return [features[f] for f in feature_order]


def get_feature_names():
    """Return ordered list of feature names (for debugging/display)."""
    return [
        'URL Length', 'Dot Count', 'Hyphen Count', 'Underscore Count',
        'Slash Count', 'Question Count', 'Equal Count', '@ Count',
        '& Count', '% Count', 'Digit Count', 'Letter Count',
        'Uses HTTPS', 'Has IP Address', 'Domain Length', 'Subdomain Count',
        'Path Length', 'Suspicious TLD', 'Digit/Letter Ratio',
        'Suspicious Keywords', 'URL Entropy'
    ]