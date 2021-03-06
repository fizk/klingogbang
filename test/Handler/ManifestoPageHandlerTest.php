<?php

namespace App\Handler;

use PHPUnit\Framework\TestCase;
use Laminas\Diactoros\Response\HtmlResponse;
use Laminas\Diactoros\ServerRequest;
use Laminas\ServiceManager\ServiceManager;
use Laminas\Diactoros\Uri;
use App\Router\RouterInterface;
use App\Service;
use function App\Router\dispatch;

class ManifestoPageHandlerTest extends TestCase
{
    public function testFetchManifestoIcelandic()
    {
        $request = (new ServerRequest())
            ->withUri(new Uri('/um'));

        $serviceManager = new ServiceManager(require './config/service.php');
        $serviceManager->setAllowOverride(true);
        $serviceManager->setFactory(Service\Manifesto::class, function () {
            return new class extends Service\AbstracManifesto{
                public function getByType($type, $lang = 'is')
                {
                    return new \stdClass;
                }
            };
        });
        $collection = $serviceManager->get(RouterInterface::class);
        $collection->setRouteConfig(require './config/router.php');
        $response = dispatch($request, $collection, $serviceManager);

        $this->assertInstanceOf(HtmlResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testFetchManifestoEnglish()
    {
        $request = (new ServerRequest())
            ->withUri(new Uri('/about'));

        $serviceManager = new ServiceManager(require './config/service.php');
        $serviceManager->setAllowOverride(true);
        $serviceManager->setFactory(Service\Manifesto::class, function () {
            return new class extends Service\AbstracManifesto{
                public function getByType($type, $lang = 'is')
                {
                    return new \stdClass;
                }
            };
        });
        $collection = $serviceManager->get(RouterInterface::class);
        $collection->setRouteConfig(require './config/router.php');
        $response = dispatch($request, $collection, $serviceManager);

        $this->assertInstanceOf(HtmlResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
    }
}
