# Wi1dcard's blog

Hey, welcome to my technical blog. This repo stands for the source codes of it. You can view the rendered website at <https://wi1dcard.dev/>.

## The Docker Image

You can also view my blog with local service powered by Nginx in Docker:

```
docker run --rm -it -p 80:80 wi1dcard/blog
```

The site would be available at <http://localhost/>.

## Current Stack

- [Hexo.io](https://hexo.io/) - A static blog generator.
- [indigo](https://github.com/yscoder/hexo-theme-indigo) - Theme for hexo with Material Design.
- [athenapdf](https://github.com/arachnys/athenapdf) - Drop-in replacement for wkhtmltopdf built on Go, Electron and Docker.
- [Caddy](https://caddyserver.com/) - Easy-configured HTTP server.
- [lint-md](https://github.com/hustcc/lint-md) - A library with the CLI tool, used to lint markdown files that in Chinese.
- [GitLab CI](https://gitlab.com/wi1dcard/blog/pipelines) - CI and CD. Ensure my writing style good, render the markdown posts and my resume into HTML or PDF files, and deploy them to Kubernetes.
- ~~Google Kubernetes Engine (GKE) - Where my blog was deployed to.~~
- Hexo plugins - More plugins are described in [packages.json](https://github.com/wi1dcard/blog/blob/master/package.json).

## TODOs

1. Use MozJPEG and pngquant to optimize images and reduce the size.

