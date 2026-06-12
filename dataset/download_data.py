import csv

# Known phishing URLs (samples from public sources)
phishing_urls = [
    # Typosquatting examples
    ("http://faceb00k.com/login", 1, "Facebook"),
    ("http://www.paypaI.com/secure", 1, "PayPal"),
    ("http://amaz0n-verification.com", 1, "Amazon"),
    ("http://netfl1x.com/account", 1, "Netflix"),
    ("http://go0gle.com/verify", 1, "Google"),
    ("http://www.apple-id-verify.com", 1, "Apple"),
    ("http://micr0soft-update.com", 1, "Microsoft"),
    ("http://www.instagrarn.com/login", 1, "Instagram"),
    ("http://dropbox-file-share.com", 1, "Dropbox"),
    ("http://linkedln-security.com", 1, "LinkedIn"),
    ("http://twittter-support.com", 1, "Twitter"),
    ("http://www.waIIetconnect.com", 1, "Crypto"),
    ("http://bankofarnerica.com", 1, "Bank of America"),
    ("http://chase-secure-verify.com", 1, "Chase"),
    ("http://www.dhI-tracking.com", 1, "DHL"),
    ("http://fedex-delivery-confirm.com", 1, "FedEx"),
    ("http://ups-package-alert.com", 1, "UPS"),
    ("http://netflix-verify-account.com", 1, "Netflix"),
    ("http://spotify-premium-offer.com", 1, "Spotify"),
    ("http://discord-nitro-free.com", 1, "Discord"),
    
    # Deceptive patterns
    ("http://secure-login-verify.com", 1, "Generic"),
    ("http://account-update-required.com", 1, "Generic"),
    ("http://security-alert-verify.com", 1, "Generic"),
    ("http://login-confirm-now.com", 1, "Generic"),
    ("http://password-reset-urgent.com", 1, "Generic"),
    ("http://billing-update-required.com", 1, "Generic"),
    ("http://suspended-account-restore.com", 1, "Generic"),
    ("http://unusual-activity-alert.com", 1, "Generic"),
    ("http://verify-your-identity-now.com", 1, "Generic"),
    ("http://limited-time-secure.com", 1, "Generic"),
    
    # IP-based / suspicious domains
    ("http://192.168.1.100/login.html", 1, "IP-based"),
    ("http://10.0.0.50/verify", 1, "IP-based"),
    ("http://bit.ly/3xK9mN2", 1, "Shortened"),
    ("http://tinyurl.com/secure-login", 1, "Shortened"),
    ("http://rb.gy/account-verify", 1, "Shortened"),
    ("http://free-iphone-win-now.xyz", 1, "Prize Scam"),
    ("http://you-won-prize-claim.xyz", 1, "Prize Scam"),
    ("http://congratulations-winner.tk", 1, "Prize Scam"),
    ("http://crypto-giveaway-airdrop.com", 1, "Crypto Scam"),
    ("http://elon-musk-giveaway.xyz", 1, "Crypto Scam"),
]

# Legitimate URLs (safe examples)
legitimate_urls = [
    ("https://www.google.com", 0, "Google"),
    ("https://www.facebook.com", 0, "Facebook"),
    ("https://www.amazon.com", 0, "Amazon"),
    ("https://www.netflix.com", 0, "Netflix"),
    ("https://www.paypal.com", 0, "PayPal"),
    ("https://www.apple.com", 0, "Apple"),
    ("https://www.microsoft.com", 0, "Microsoft"),
    ("https://www.github.com", 0, "GitHub"),
    ("https://www.stackoverflow.com", 0, "StackOverflow"),
    ("https://www.wikipedia.org", 0, "Wikipedia"),
    ("https://www.youtube.com", 0, "YouTube"),
    ("https://www.linkedin.com", 0, "LinkedIn"),
    ("https://www.twitter.com", 0, "Twitter"),
    ("https://www.instagram.com", 0, "Instagram"),
    ("https://www.reddit.com", 0, "Reddit"),
    ("https://www.spotify.com", 0, "Spotify"),
    ("https://www.dropbox.com", 0, "Dropbox"),
    ("https://www.discord.com", 0, "Discord"),
    ("https://www.zoom.us", 0, "Zoom"),
    ("https://www.slack.com", 0, "Slack"),
    ("https://www.canva.com", 0, "Canva"),
    ("https://www.notion.so", 0, "Notion"),
    ("https://www.figma.com", 0, "Figma"),
    ("https://www.cloudflare.com", 0, "Cloudflare"),
    ("https://www.cloudfront.net", 0, "AWS"),
    ("https://www.office.com", 0, "Microsoft Office"),
    ("https://www.adobe.com", 0, "Adobe"),
    ("https://www.salesforce.com", 0, "Salesforce"),
    ("https://www.shopify.com", 0, "Shopify"),
    ("https://www.etsy.com", 0, "Etsy"),
    ("https://www.ebay.com", 0, "eBay"),
    ("https://www.walmart.com", 0, "Walmart"),
    ("https://www.target.com", 0, "Target"),
    ("https://www.nytimes.com", 0, "NY Times"),
    ("https://www.cnn.com", 0, "CNN"),
    ("https://www.bbc.com", 0, "BBC"),
    ("https://www.medium.com", 0, "Medium"),
    ("https://www.quora.com", 0, "Quora"),
    ("https://www.pinterest.com", 0, "Pinterest"),
    ("https://www.twitch.tv", 0, "Twitch"),
]

# Combine both
all_urls = phishing_urls + legitimate_urls

# Save to CSV
with open("phishing_urls.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["url", "label", "target"])
    writer.writeheader()
    for entry in all_urls:
        writer.writerow({
            "url": entry[0],
            "label": entry[1],
            "target": entry[2]
        })

print(f"Dataset created!")
print(f"  Phishing URLs:  {len(phishing_urls)}")
print(f"  Legitimate URLs: {len(legitimate_urls)}")
print(f"  Total:           {len(all_urls)}")
print(f"Saved to: dataset/phishing_urls.csv")