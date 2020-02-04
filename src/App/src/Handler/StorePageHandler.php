<?php

declare(strict_types=1);

namespace App\Handler;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Zend\Diactoros\Response\HtmlResponse;
use Zend\Expressive\Template\TemplateRendererInterface;
use Zend\Expressive\Router;
use App\Service;

class StorePageHandler implements RequestHandlerInterface
{
    /** @var Router\RouterInterface */
    private $router;

    /** @var null|TemplateRendererInterface */
    private $template;

    /** @var \App\Service\Inventory */
    private $inventory;

    public function __construct(
        Router\RouterInterface $router,
        Service\Inventory $inventory,
        TemplateRendererInterface $template
    ) {
        $this->router    = $router;
        $this->inventory = $inventory;
        $this->template  = $template;
    }

    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        $inventory = $this->inventory->fetchList($request->getAttribute('language', 'is'));
        return new HtmlResponse($this->template->render('app::store-page', ['inventory' => $inventory]));
    }
}
