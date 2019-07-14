<?php

declare(strict_types=1);

namespace App\Factory;

use Aptoma\Twig\Extension\MarkdownExtension;
use Aptoma\Twig\Extension\MarkdownEngine;
use Psr\Container\ContainerInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Zend\Expressive\Router\RouterInterface;
use Zend\Expressive\Template\TemplateRendererInterface;
use App\Service;
use App\Handler;

use function get_class;

class ManifestoSavePageHandlerFactory
{
    public function __invoke(ContainerInterface $container) : RequestHandlerInterface
    {
        $router = $container->get(RouterInterface::class);
        $manifesto  = $container->get(Service\Manifesto::class);

        return new Handler\ManifestoSavePageHandler($router, $manifesto);
    }
}
