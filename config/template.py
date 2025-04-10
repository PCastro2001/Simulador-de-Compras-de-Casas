# CONFIG TEMPLATE
# --------------------------------------

TEMPLATE_CONFIG = {
    "layout": "vertical",             # Options[String]: vertical(default), horizontal
    "theme": "theme-default",         # Options[String]: theme-default(default), theme-bordered, theme-semi-dark
    "style": "light",                 # Options[String]: light(default), dark, system mode
    "has_customizer": True,           # options[Boolean]: True(default), False # Display customizer or not THIS WILL REMOVE INCLUDED JS FILE. SO LOCAL STORAGE WON'T WORK
    "display_customizer": True,       # options[Boolean]: True(default), False # Display customizer UI or not, THIS WON'T REMOVE INCLUDED JS FILE. SO LOCAL STORAGE WILL WORK
    "content_layout": "compact",      # options[String]: 'compact', 'wide' (compact=container-xxl, wide=container-fluid)
    "navbar_type": "fixed",           # options[String]: 'fixed', 'static', 'hidden' (Only for vertical Layout)
    "header_type": "fixed",           # options[String]: 'static', 'fixed' (for horizontal layout only)
    "menu_fixed": True,               # options[Boolean]: True(default), False # Layout(menu) Fixed (Only for vertical Layout)
    "menu_collapsed": False,          # options[Boolean]: False(default), True # Show menu collapsed, Only for vertical Layout
    "footer_fixed": False,            # options[Boolean]: False(default), True # Footer Fixed
    "show_dropdown_onhover": True,    # True, False (for horizontal layout only)
    "customizer_controls": [
        "style",
        "headerType",
        "contentLayout",
        "layoutCollapsed",
        "showDropdownOnHover",
        "layoutNavbarOptions",
        "themes",
    ],  
}

# THEME VARIABLES
THEME_VARIABLES = {
    "creator_name": ["Daniel Torres", "Pablo Castro"],
    "creator_url": "",
    "template_name": "Simulador",
    "template_suffix": "",
    "template_version": "1.0.0",
    "template_free": True,
    "template_description": "",
    "template_keyword": "",
    "facebook_url": "",
    "twitter_url": "",
    "github_url": "",
    "dribbble_url": "",
    "instagram_url": "",
    "license_url": "",
    "live_preview": "",
    "product_page": "",
    "support": "",
    "more_themes": "",
    "documentation": "",
    "changelog": "",
    "git_repository": "",
    "git_repo_access": "",
}

THEME_LAYOUT_DIR = "layout"