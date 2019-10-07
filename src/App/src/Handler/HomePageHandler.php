<?php

declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Zend\Diactoros\Response\HtmlResponse;
use Zend\Expressive\Router;
use Zend\Expressive\Template\TemplateRendererInterface;
use App\Service;
use DateTime;

class HomePageHandler implements RequestHandlerInterface
{
    /** @var Router\RouterInterface */
    private $router;

    /** @var null|TemplateRendererInterface */
    private $template;

    /** @var \App\Service\Entry */
    private $entry;

    public function __construct(
        Router\RouterInterface $router,
        Service\Entry $entry,
        TemplateRendererInterface $template
    ) {
        $this->router   = $router;
        $this->entry    = $entry;
        $this->template = $template;
    }

    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        $current = $this->entry->fetchByDate(new DateTime());
        $upcoming = $this->entry->fetchAfter(new DateTime());

        $list = empty($current) ? $upcoming : $current;
        $next = empty($current) ? [] : $upcoming;
        $fallback = empty($list) && empty($next) ? $this->entry->fetchList((new DateTime())->format('Y')) : null;

        return new HtmlResponse(
            $this->template->render('app::home-page', [
                'list' => $fallback ? : $list,
                'upcoming' => $next,
            ])
        );
    }
}
