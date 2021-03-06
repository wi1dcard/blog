# Wi1dcard's Blog

[![pipeline status](https://gitlab.com/wi1dcard/blog/badges/master/pipeline.svg)](https://gitlab.com/wi1dcard/blog/-/commits/master)

Hello! Welcome to my technical blog. This repo hosted on [GitLab](https://gitlab.com/wi1dcard/blog) contains all the source codes of it. You can view the rendered website on <https://wi1dcard.dev/>.

## The Docker Image

You can also start the local service powered by Nginx and Docker:

```bash
docker run --rm -it -p 80:80 wi1dcard/blog
```

The site would be available on <http://localhost/>.

## Current Stack

- [Hexo.io](https://hexo.io/) - A static blog generator.
- [indigo](https://github.com/yscoder/hexo-theme-indigo) - Theme for hexo with Material Design.
- [athenapdf](https://github.com/arachnys/athenapdf) - Drop-in replacement for wkhtmltopdf built on Go, Electron and Docker.
- [Caddy](https://caddyserver.com/) - Easy-configured HTTP server.
- [lint-md](https://github.com/hustcc/lint-md) - A library with the CLI tool, used to lint markdown files that in Chinese.
- [imagemin](https://github.com/imagemin/imagemin) - with MozJPEG and pngquant plug-ins. Optimize the images and reduce the sizes during building.
- [GitLab CI](https://gitlab.com/wi1dcard/blog/pipelines) - CI and CD. Ensure my writing style good, render the posts and my resume written in Markdown into HTML or PDF files, and deploy them.
- ~~Google Kubernetes Engine (GKE) - Where my blog was deployed to.~~
- Hexo plugins - More plugins are described in [packages.json](https://github.com/wi1dcard/blog/blob/master/package.json).
