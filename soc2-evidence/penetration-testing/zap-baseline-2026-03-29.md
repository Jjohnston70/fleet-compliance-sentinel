# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 5 |
| Low | 5 |
| Informational | 4 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Low | Warning |  | ZAP warnings logged - see the zap.log file for details | 2    |
| Info | Informational | https://www.pipelinepunks.com | Percentage of responses with status code 2xx | 73 % |
| Info | Informational | https://www.pipelinepunks.com | Percentage of responses with status code 3xx | 2 % |
| Info | Informational | https://www.pipelinepunks.com | Percentage of responses with status code 4xx | 23 % |
| Info | Informational | https://www.pipelinepunks.com | Percentage of endpoints with content type application/javascript | 37 % |
| Info | Informational | https://www.pipelinepunks.com | Percentage of endpoints with content type application/xml | 2 % |
| Info | Informational | https://www.pipelinepunks.com | Percentage of endpoints with content type image/png | 5 % |
| Info | Informational | https://www.pipelinepunks.com | Percentage of endpoints with content type image/vnd.microsoft.icon | 2 % |
| Info | Informational | https://www.pipelinepunks.com | Percentage of endpoints with content type text/css | 2 % |
| Info | Informational | https://www.pipelinepunks.com | Percentage of endpoints with content type text/html | 43 % |
| Info | Informational | https://www.pipelinepunks.com | Percentage of endpoints with content type text/plain | 5 % |
| Info | Informational | https://www.pipelinepunks.com | Percentage of endpoints with method GET | 100 % |
| Info | Informational | https://www.pipelinepunks.com | Count of total endpoints | 37    |
| Info | Informational | https://www.pipelinepunks.com | Percentage of slow responses | 85 % |




## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| CSP: Wildcard Directive | Medium | Systemic |
| CSP: script-src unsafe-inline | Medium | Systemic |
| CSP: style-src unsafe-inline | Medium | Systemic |
| Cross-Domain Misconfiguration | Medium | Systemic |
| Sub Resource Integrity Attribute Missing | Medium | Systemic |
| CSP: Notices | Low | Systemic |
| Cross-Domain JavaScript Source File Inclusion | Low | Systemic |
| Cross-Origin-Embedder-Policy Header Missing or Invalid | Low | Systemic |
| Cross-Origin-Opener-Policy Header Missing or Invalid | Low | Systemic |
| Cross-Origin-Resource-Policy Header Missing or Invalid | Low | 2 |
| Re-examine Cache-control Directives | Informational | Systemic |
| Retrieved from Cache | Informational | Systemic |
| Storable and Cacheable Content | Informational | Systemic |
| Storable but Non-Cacheable Content | Informational | Systemic |




## Alert Detail



### [ CSP: Wildcard Directive ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=32&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=32&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
img-src, font-src`
* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=64&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=64&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
img-src, font-src`
* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=640&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=640&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
img-src, font-src`
* URL: https://www.pipelinepunks.com/%252FService-Disabled%2520Veteran-Owned-Certified.png&w=128&q=75
  * Node Name: `https://www.pipelinepunks.com//Service-Disabled Veteran-Owned-Certified.png&w=128&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
img-src, font-src`
* URL: https://www.pipelinepunks.com/%252FVeteran-Owned%2520Certified.png&w=64&q=75
  * Node Name: `https://www.pipelinepunks.com//Veteran-Owned Certified.png&w=64&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
img-src, font-src`

Instances: Systemic


### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://web.dev/articles/csp#resource-options ](https://web.dev/articles/csp#resource-options)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ CSP: script-src unsafe-inline ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=32&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=32&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `script-src includes unsafe-inline.`
* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=64&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=64&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `script-src includes unsafe-inline.`
* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=640&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=640&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `script-src includes unsafe-inline.`
* URL: https://www.pipelinepunks.com/%252FService-Disabled%2520Veteran-Owned-Certified.png&w=128&q=75
  * Node Name: `https://www.pipelinepunks.com//Service-Disabled Veteran-Owned-Certified.png&w=128&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `script-src includes unsafe-inline.`
* URL: https://www.pipelinepunks.com/%252FVeteran-Owned%2520Certified.png&w=64&q=75
  * Node Name: `https://www.pipelinepunks.com//Veteran-Owned Certified.png&w=64&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `script-src includes unsafe-inline.`

Instances: Systemic


### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://web.dev/articles/csp#resource-options ](https://web.dev/articles/csp#resource-options)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ CSP: style-src unsafe-inline ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=32&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=32&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `style-src includes unsafe-inline.`
* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=64&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=64&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `style-src includes unsafe-inline.`
* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=640&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=640&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `style-src includes unsafe-inline.`
* URL: https://www.pipelinepunks.com/%252FService-Disabled%2520Veteran-Owned-Certified.png&w=128&q=75
  * Node Name: `https://www.pipelinepunks.com//Service-Disabled Veteran-Owned-Certified.png&w=128&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `style-src includes unsafe-inline.`
* URL: https://www.pipelinepunks.com/%252FVeteran-Owned%2520Certified.png&w=64&q=75
  * Node Name: `https://www.pipelinepunks.com//Veteran-Owned Certified.png&w=64&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `style-src includes unsafe-inline.`

Instances: Systemic


### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://web.dev/articles/csp#resource-options ](https://web.dev/articles/csp#resource-options)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ Cross-Domain Misconfiguration ](https://www.zaproxy.org/docs/alerts/10098/)



##### Medium (Medium)

### Description

Web browser data loading may be possible, due to a Cross Origin Resource Sharing (CORS) misconfiguration on the web server.

* URL: https://www.pipelinepunks.com/_next/image%3Fq=75&url=%252FVeteran-Owned%2520Certified.png&w=128
  * Node Name: `https://www.pipelinepunks.com/_next/image (q,url,w)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `The CORS misconfiguration on the web server permits cross-domain read requests from arbitrary third party domains, using unauthenticated APIs on this domain. Web browser implementations do not permit arbitrary third parties to read the response from authenticated APIs, however. This reduces the risk somewhat. This misconfiguration could be used by an attacker to access data that is available in an unauthenticated manner, but which uses some other form of security, such as IP address white-listing.`
* URL: https://www.pipelinepunks.com/_next/static/chunks/app/global-error-199f63274387ec62.js%3Fdpl=dpl_4QgvXSrg3hKSswwDu6NmTZEh2xJY
  * Node Name: `https://www.pipelinepunks.com/_next/static/chunks/app/global-error-199f63274387ec62.js (dpl)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `The CORS misconfiguration on the web server permits cross-domain read requests from arbitrary third party domains, using unauthenticated APIs on this domain. Web browser implementations do not permit arbitrary third parties to read the response from authenticated APIs, however. This reduces the risk somewhat. This misconfiguration could be used by an attacker to access data that is available in an unauthenticated manner, but which uses some other form of security, such as IP address white-listing.`
* URL: https://www.pipelinepunks.com/_next/static/chunks/main-app-9d3ef93de4755f4a.js%3Fdpl=dpl_4QgvXSrg3hKSswwDu6NmTZEh2xJY
  * Node Name: `https://www.pipelinepunks.com/_next/static/chunks/main-app-9d3ef93de4755f4a.js (dpl)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `The CORS misconfiguration on the web server permits cross-domain read requests from arbitrary third party domains, using unauthenticated APIs on this domain. Web browser implementations do not permit arbitrary third parties to read the response from authenticated APIs, however. This reduces the risk somewhat. This misconfiguration could be used by an attacker to access data that is available in an unauthenticated manner, but which uses some other form of security, such as IP address white-listing.`
* URL: https://www.pipelinepunks.com/_next/static/chunks/webpack-41cf2323c37d41b7.js%3Fdpl=dpl_4QgvXSrg3hKSswwDu6NmTZEh2xJY
  * Node Name: `https://www.pipelinepunks.com/_next/static/chunks/webpack-41cf2323c37d41b7.js (dpl)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `The CORS misconfiguration on the web server permits cross-domain read requests from arbitrary third party domains, using unauthenticated APIs on this domain. Web browser implementations do not permit arbitrary third parties to read the response from authenticated APIs, however. This reduces the risk somewhat. This misconfiguration could be used by an attacker to access data that is available in an unauthenticated manner, but which uses some other form of security, such as IP address white-listing.`
* URL: https://www.pipelinepunks.com/robots.txt
  * Node Name: `https://www.pipelinepunks.com/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `The CORS misconfiguration on the web server permits cross-domain read requests from arbitrary third party domains, using unauthenticated APIs on this domain. Web browser implementations do not permit arbitrary third parties to read the response from authenticated APIs, however. This reduces the risk somewhat. This misconfiguration could be used by an attacker to access data that is available in an unauthenticated manner, but which uses some other form of security, such as IP address white-listing.`

Instances: Systemic


### Solution

Ensure that sensitive data is not available in an unauthenticated manner (using IP address white-listing, for instance).
Configure the "Access-Control-Allow-Origin" HTTP header to a more restrictive set of domains, or remove all CORS headers entirely, to allow the web browser to enforce the Same Origin Policy (SOP) in a more restrictive manner.

### Reference


* [ https://vulncat.fortify.com/en/detail?category=HTML5&subcategory=Overly%20Permissive%20CORS%20Policy ](https://vulncat.fortify.com/en/detail?category=HTML5&subcategory=Overly%20Permissive%20CORS%20Policy)


#### CWE Id: [ 264 ](https://cwe.mitre.org/data/definitions/264.html)


#### WASC Id: 14

#### Source ID: 3

### [ Sub Resource Integrity Attribute Missing ](https://www.zaproxy.org/docs/alerts/90003/)



##### Medium (High)

### Description

The integrity attribute is missing on a script or link tag served by an external server. The integrity tag prevents an attacker who have gained access to this server from injecting a malicious content.

* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=32&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=32&q=75`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script src="https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-js-script="true" async="" crossorigin="anonymous" data-clerk-publishable-key="pk_live_Y2xlcmsucGlwZWxpbmVwdW5rcy5jb20k"></script>`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=64&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=64&q=75`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script src="https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-js-script="true" async="" crossorigin="anonymous" data-clerk-publishable-key="pk_live_Y2xlcmsucGlwZWxpbmVwdW5rcy5jb20k"></script>`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=640&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=640&q=75`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script src="https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-js-script="true" async="" crossorigin="anonymous" data-clerk-publishable-key="pk_live_Y2xlcmsucGlwZWxpbmVwdW5rcy5jb20k"></script>`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/%252FService-Disabled%2520Veteran-Owned-Certified.png&w=128&q=75
  * Node Name: `https://www.pipelinepunks.com//Service-Disabled Veteran-Owned-Certified.png&w=128&q=75`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script src="https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-js-script="true" async="" crossorigin="anonymous" data-clerk-publishable-key="pk_live_Y2xlcmsucGlwZWxpbmVwdW5rcy5jb20k"></script>`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/%252FVeteran-Owned%2520Certified.png&w=64&q=75
  * Node Name: `https://www.pipelinepunks.com//Veteran-Owned Certified.png&w=64&q=75`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script src="https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-js-script="true" async="" crossorigin="anonymous" data-clerk-publishable-key="pk_live_Y2xlcmsucGlwZWxpbmVwdW5rcy5jb20k"></script>`
  * Other Info: ``

Instances: Systemic


### Solution

Provide a valid integrity attribute to the tag.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity ](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)


#### CWE Id: [ 345 ](https://cwe.mitre.org/data/definitions/345.html)


#### WASC Id: 15

#### Source ID: 3

### [ CSP: Notices ](https://www.zaproxy.org/docs/alerts/10055/)



##### Low (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=32&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=32&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `Warnings:
The report-uri directive has been deprecated in favor of the new report-to directive
`
* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=64&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=64&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `Warnings:
The report-uri directive has been deprecated in favor of the new report-to directive
`
* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=640&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=640&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `Warnings:
The report-uri directive has been deprecated in favor of the new report-to directive
`
* URL: https://www.pipelinepunks.com/%252FService-Disabled%2520Veteran-Owned-Certified.png&w=128&q=75
  * Node Name: `https://www.pipelinepunks.com//Service-Disabled Veteran-Owned-Certified.png&w=128&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `Warnings:
The report-uri directive has been deprecated in favor of the new report-to directive
`
* URL: https://www.pipelinepunks.com/%252FVeteran-Owned%2520Certified.png&w=128&q=75
  * Node Name: `https://www.pipelinepunks.com//Veteran-Owned Certified.png&w=128&q=75`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; script-src-elem 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://vercel.live https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com wss://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pipelinepunks.com https://challenges.cloudflare.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; report-uri /api/csp-report; report-to csp-endpoint; upgrade-insecure-requests`
  * Other Info: `Warnings:
The report-uri directive has been deprecated in favor of the new report-to directive
`

Instances: Systemic


### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://web.dev/articles/csp#resource-options ](https://web.dev/articles/csp#resource-options)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ Cross-Domain JavaScript Source File Inclusion ](https://www.zaproxy.org/docs/alerts/10017/)



##### Low (Medium)

### Description

The page includes one or more script files from a third-party domain.

* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=256&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=256&q=75`
  * Method: `GET`
  * Parameter: `https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js`
  * Attack: ``
  * Evidence: `<script src="https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-js-script="true" async="" crossorigin="anonymous" data-clerk-publishable-key="pk_live_Y2xlcmsucGlwZWxpbmVwdW5rcy5jb20k"></script>`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=32&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=32&q=75`
  * Method: `GET`
  * Parameter: `https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js`
  * Attack: ``
  * Evidence: `<script src="https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-js-script="true" async="" crossorigin="anonymous" data-clerk-publishable-key="pk_live_Y2xlcmsucGlwZWxpbmVwdW5rcy5jb20k"></script>`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/%252FPipelineX-penny.png&w=64&q=75
  * Node Name: `https://www.pipelinepunks.com//PipelineX-penny.png&w=64&q=75`
  * Method: `GET`
  * Parameter: `https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js`
  * Attack: ``
  * Evidence: `<script src="https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-js-script="true" async="" crossorigin="anonymous" data-clerk-publishable-key="pk_live_Y2xlcmsucGlwZWxpbmVwdW5rcy5jb20k"></script>`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/%252FService-Disabled%2520Veteran-Owned-Certified.png&w=128&q=75
  * Node Name: `https://www.pipelinepunks.com//Service-Disabled Veteran-Owned-Certified.png&w=128&q=75`
  * Method: `GET`
  * Parameter: `https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js`
  * Attack: ``
  * Evidence: `<script src="https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-js-script="true" async="" crossorigin="anonymous" data-clerk-publishable-key="pk_live_Y2xlcmsucGlwZWxpbmVwdW5rcy5jb20k"></script>`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/%252FVeteran-Owned%2520Certified.png&w=64&q=75
  * Node Name: `https://www.pipelinepunks.com//Veteran-Owned Certified.png&w=64&q=75`
  * Method: `GET`
  * Parameter: `https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js`
  * Attack: ``
  * Evidence: `<script src="https://clerk.pipelinepunks.com/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-js-script="true" async="" crossorigin="anonymous" data-clerk-publishable-key="pk_live_Y2xlcmsucGlwZWxpbmVwdW5rcy5jb20k"></script>`
  * Other Info: ``

Instances: Systemic


### Solution

Ensure JavaScript source files are loaded from only trusted sources, and the sources can't be controlled by end users of the application.

### Reference



#### CWE Id: [ 829 ](https://cwe.mitre.org/data/definitions/829.html)


#### WASC Id: 15

#### Source ID: 3

### [ Cross-Origin-Embedder-Policy Header Missing or Invalid ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Embedder-Policy header is a response header that prevents a document from loading any cross-origin resources that don't explicitly grant the document permission (using CORP or CORS).

* URL: https://www.pipelinepunks.com/accessibility
  * Node Name: `https://www.pipelinepunks.com/accessibility`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://www.pipelinepunks.com/privacy
  * Node Name: `https://www.pipelinepunks.com/privacy`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://www.pipelinepunks.com/sign-in
  * Node Name: `https://www.pipelinepunks.com/sign-in`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://www.pipelinepunks.com/sign-up
  * Node Name: `https://www.pipelinepunks.com/sign-up`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://www.pipelinepunks.com/sitemap.xml
  * Node Name: `https://www.pipelinepunks.com/sitemap.xml`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that the application/web server sets the Cross-Origin-Embedder-Policy header appropriately, and that it sets the Cross-Origin-Embedder-Policy header to 'require-corp' for documents.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Embedder-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-embedder-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Cross-Origin-Opener-Policy Header Missing or Invalid ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Opener-Policy header is a response header that allows a site to control if others included documents share the same browsing context. Sharing the same browsing context with untrusted documents might lead to data leak.

* URL: https://www.pipelinepunks.com/accessibility
  * Node Name: `https://www.pipelinepunks.com/accessibility`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://www.pipelinepunks.com/sign-in
  * Node Name: `https://www.pipelinepunks.com/sign-in`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://www.pipelinepunks.com/sign-up
  * Node Name: `https://www.pipelinepunks.com/sign-up`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://www.pipelinepunks.com/sitemap.xml
  * Node Name: `https://www.pipelinepunks.com/sitemap.xml`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://www.pipelinepunks.com/terms
  * Node Name: `https://www.pipelinepunks.com/terms`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that the application/web server sets the Cross-Origin-Opener-Policy header appropriately, and that it sets the Cross-Origin-Opener-Policy header to 'same-origin' for documents.
'same-origin-allow-popups' is considered as less secured and should be avoided.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Opener-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-opener-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Cross-Origin-Resource-Policy Header Missing or Invalid ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Resource-Policy header is an opt-in header designed to counter side-channels attacks like Spectre. Resource should be specifically set as shareable amongst different origins.

* URL: https://www.pipelinepunks.com/sign-in
  * Node Name: `https://www.pipelinepunks.com/sign-in`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://www.pipelinepunks.com/sign-up
  * Node Name: `https://www.pipelinepunks.com/sign-up`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 2

### Solution

Ensure that the application/web server sets the Cross-Origin-Resource-Policy header appropriately, and that it sets the Cross-Origin-Resource-Policy header to 'same-origin' for all web pages.
'same-site' is considered as less secured and should be avoided.
If resources must be shared, set the header to 'cross-origin'.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Resource-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-resource-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Re-examine Cache-control Directives ](https://www.zaproxy.org/docs/alerts/10015/)



##### Informational (Low)

### Description

The cache-control header has not been set properly or is missing, allowing the browser and proxies to cache content. For static assets like css, js, or image files this might be intended, however, the resources should be reviewed to ensure that no sensitive content will be cached.

* URL: https://www.pipelinepunks.com/accessibility
  * Node Name: `https://www.pipelinepunks.com/accessibility`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: `public, max-age=0, must-revalidate`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/privacy
  * Node Name: `https://www.pipelinepunks.com/privacy`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: `public, max-age=0, must-revalidate`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/sitemap.xml
  * Node Name: `https://www.pipelinepunks.com/sitemap.xml`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: `public, max-age=0, must-revalidate`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/terms
  * Node Name: `https://www.pipelinepunks.com/terms`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: `public, max-age=0, must-revalidate`
  * Other Info: ``

Instances: Systemic


### Solution

For secure content, ensure the cache-control HTTP header is set with "no-cache, no-store, must-revalidate". If an asset should be cached consider setting the directives "public, max-age, immutable".

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching ](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching)
* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
* [ https://grayduck.mn/2021/09/13/cache-control-recommendations/ ](https://grayduck.mn/2021/09/13/cache-control-recommendations/)


#### CWE Id: [ 525 ](https://cwe.mitre.org/data/definitions/525.html)


#### WASC Id: 13

#### Source ID: 3

### [ Retrieved from Cache ](https://www.zaproxy.org/docs/alerts/10050/)



##### Informational (Medium)

### Description

The content was retrieved from a shared cache. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where caching servers such as "proxy" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.

* URL: https://www.pipelinepunks.com/_next/image%3Fq=75&url=%252FPipelineX-penny.png&w=64
  * Node Name: `https://www.pipelinepunks.com/_next/image (q,url,w)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Age: 2378663`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://www.pipelinepunks.com/_next/image%3Fq=75&url=%252FService-Disabled%2520Veteran-Owned-Certified.png&w=128
  * Node Name: `https://www.pipelinepunks.com/_next/image (q,url,w)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Age: 2378671`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://www.pipelinepunks.com/_next/image%3Fq=75&url=%252FVeteran-Owned%2520Certified.png&w=128
  * Node Name: `https://www.pipelinepunks.com/_next/image (q,url,w)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Age: 2378673`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://www.pipelinepunks.com/_next/static/chunks/app/global-error-199f63274387ec62.js%3Fdpl=dpl_4QgvXSrg3hKSswwDu6NmTZEh2xJY
  * Node Name: `https://www.pipelinepunks.com/_next/static/chunks/app/global-error-199f63274387ec62.js (dpl)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Age: 186`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://www.pipelinepunks.com/robots.txt
  * Node Name: `https://www.pipelinepunks.com/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Age: 50`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`

Instances: Systemic


### Solution

Validate that the response does not contain sensitive, personal or user-specific information. If it does, consider the use of the following HTTP response headers, to limit, or prevent the content being stored and retrieved from the cache by another user:
Cache-Control: no-cache, no-store, must-revalidate, private
Pragma: no-cache
Expires: 0
This configuration directs both HTTP 1.0 and HTTP 1.1 compliant caching servers to not store the response, and to not retrieve the response (without validation) from the cache, in response to a similar request.

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.rfc-editor.org/rfc/rfc9110.html ](https://www.rfc-editor.org/rfc/rfc9110.html)


#### CWE Id: [ 525 ](https://cwe.mitre.org/data/definitions/525.html)


#### Source ID: 3

### [ Storable and Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, and may be retrieved directly from the cache, rather than from the origin server by the caching servers, in response to similar requests from other users. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where "shared" caching servers such as "proxy" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.

* URL: https://www.pipelinepunks.com/_next/static/chunks/1356-93a730dd37d534c9.js%3Fdpl=dpl_4QgvXSrg3hKSswwDu6NmTZEh2xJY
  * Node Name: `https://www.pipelinepunks.com/_next/static/chunks/1356-93a730dd37d534c9.js (dpl)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=31536000`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/_next/static/chunks/52774a7f-f1523b013c77c5a5.js%3Fdpl=dpl_4QgvXSrg3hKSswwDu6NmTZEh2xJY
  * Node Name: `https://www.pipelinepunks.com/_next/static/chunks/52774a7f-f1523b013c77c5a5.js (dpl)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=31536000`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/_next/static/chunks/app/global-error-199f63274387ec62.js%3Fdpl=dpl_4QgvXSrg3hKSswwDu6NmTZEh2xJY
  * Node Name: `https://www.pipelinepunks.com/_next/static/chunks/app/global-error-199f63274387ec62.js (dpl)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=31536000`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/_next/static/chunks/app/sign-up/%255B%255B...sign-up%255D%255D/page-cfabf02063521948.js%3Fdpl=dpl_4QgvXSrg3hKSswwDu6NmTZEh2xJY
  * Node Name: `https://www.pipelinepunks.com/_next/static/chunks/app/sign-up/[[...sign-up]]/page-cfabf02063521948.js (dpl)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=31536000`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/_next/static/chunks/webpack-41cf2323c37d41b7.js%3Fdpl=dpl_4QgvXSrg3hKSswwDu6NmTZEh2xJY
  * Node Name: `https://www.pipelinepunks.com/_next/static/chunks/webpack-41cf2323c37d41b7.js (dpl)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=31536000`
  * Other Info: ``

Instances: Systemic


### Solution

Validate that the response does not contain sensitive, personal or user-specific information. If it does, consider the use of the following HTTP response headers, to limit, or prevent the content being stored and retrieved from the cache by another user:
Cache-Control: no-cache, no-store, must-revalidate, private
Pragma: no-cache
Expires: 0
This configuration directs both HTTP 1.0 and HTTP 1.1 compliant caching servers to not store the response, and to not retrieve the response (without validation) from the cache, in response to a similar request.

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3

### [ Storable but Non-Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, but will not be retrieved directly from the cache, without validating the request upstream, in response to similar requests from other users.

* URL: https://www.pipelinepunks.com/PipelineX-penny.png
  * Node Name: `https://www.pipelinepunks.com/PipelineX-penny.png`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=0`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/_next/image%3Fq=75&url=%252FPipelineX-penny.png&w=640
  * Node Name: `https://www.pipelinepunks.com/_next/image (q,url,w)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=0`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/api
  * Node Name: `https://www.pipelinepunks.com/api`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=0`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/api/
  * Node Name: `https://www.pipelinepunks.com/api/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=0`
  * Other Info: ``
* URL: https://www.pipelinepunks.com/penny
  * Node Name: `https://www.pipelinepunks.com/penny`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=0`
  * Other Info: ``

Instances: Systemic


### Solution



### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3


