from flask import Flask, render_template, request, url_for, redirect
from admin import admin_alert_thread


# Copyright 2021 Johnathan Pennington | All rights reserved.


app = Flask(__name__)


@app.errorhandler(404)
def page_not_found(e):

    subdomain_redirects = ('core', 'wordplay', 'mira3', 'soundx', 'harmio', 'volatile3gons', 'music', 'el')
    # If 'abc' is included, beetlebox.dev/abc/xyz is redirected to abc.beetlebox.dev/xyz

    skip_endpoints = tuple()  # Skip any endpoints requiring request.args, and any others to not suggest for redirect.
    ignore_paths_starting_with = [  # Doesn't send an admin alert if request.path starts with any of these.
        '20', 'admin', 'blog', 'cms', 'feed', 'media', 'misc', 'news', 'robots', 'site', 'sito',
        'shop', 'test', 'web', 'wordpress', 'Wordpress', 'wp', 'Wp', 'xmlrpc.php',
    ]

    # Redirect old url to new subdomain. i.e. beetlebox.dev/core/xyz => core.beetlebox.dev/xyz
    for subdomain_name in subdomain_redirects:
        if request.path.startswith(f'/{subdomain_name}'):
            subdomain_redirect = f'https://{subdomain_name}.beetlebox.dev'
            if request.path.startswith(f'/{subdomain_name}/'):
                sub_path = request.path.split(f'/{subdomain_name}/', 1)[-1]
                subdomain_redirect += f'/{sub_path}'
            return redirect(subdomain_redirect)

    site_root = url_for('home', _external=True).split('//', 1)[-1][:-1]
    # Siteroot includes domain, but removes http:// or https:// if present, and removes the final forward slash.
    a_text = site_root
    a_href = '/'

    request_of_concern = True  # Requests of concern are paths not filtered by ignore_paths_starting_with.
    # If request_of_concern remains True, an attempt is made to suggest a more specific url on not found page,
    # and an admin alert is sent.
    for path_to_ignore in ignore_paths_starting_with:
        if request.path.startswith(f'/{path_to_ignore}'):
            request_of_concern = False
            break

    if request_of_concern:

        # Look for nearest valid path.
        for rule in app.url_map.iter_rules():
            if "GET" in rule.methods and rule.endpoint not in skip_endpoints and len(rule.arguments) == 0:
                # Static folder has rule.arguments, so is skipped and rerouted to root.
                if request.path.startswith(rule.rule):  # Rule.rule is relative path.
                    a_href = url_for(rule.endpoint)
                    if a_href == '/':
                        continue  # Otherwise, displays final slash after site root <a> text.
                    a_text = f'{site_root}<wbr>{a_href}'
                    break

        message_body = f'Page not found: \n{request.url}\n' \
                       f'Rendered page_not_found.html and suggested: \n{site_root}{a_href}'
        admin_alert_thread('Web App - 404', message_body)

    return render_template('page_not_found.html', relpath=a_href, a_text=a_text), 404


@app.route('/favicon.ico')
def favicon():
    return redirect(url_for('static', filename='favicon.ico'))


# CV
@app.route('/qr/p')
def qr_cv():
    return redirect(url_for('info'))


# App Buttons
@app.route('/')
def home():
    return render_template('apps.html')


@app.route('/info')
def info():
    return render_template('info.html')


if __name__ == '__main__':
    app.run()
