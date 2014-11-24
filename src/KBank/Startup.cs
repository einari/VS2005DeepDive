using Microsoft.AspNet.Builder;
using Microsoft.Framework.DependencyInjection;

namespace KForum
{
    public class Startup
    {
        public void Configure(IApplicationBuilder app)
        {
            app.UseSignalR();

            // For more information on how to configure your application, visit http://go.microsoft.com/fwlink/?LinkID=398940
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSignalR();
        }


        public void ConfigureDevelopment(IApplicationBuilder app)
        {
            Configure(app);
        }
    }
}
