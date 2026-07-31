import reflex as rx

config = rx.Config(
    app_name="nha_may_app",
    plugins=[
        rx.plugins.SitemapPlugin(),
        rx.plugins.TailwindV4Plugin(),
    ]
)