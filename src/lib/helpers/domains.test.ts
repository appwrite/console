import { describe, expect, it } from 'vitest';
import { parseDnsRecords } from './domains';

describe('parseDnsRecords', () => {
    it('should parse standard zone file with origin', () => {
        const content = `$ORIGIN example.com.     ; designates the start of this zone file in the namespace
$TTL 3600                ; default expiration time (in seconds) of all RRs without their own TTL value
example.com.  IN  SOA   ns.example.com. username.example.com. ( 2020091025 7200 3600 1209600 3600 )
example.com.  IN  NS    ns                    ; ns.example.com is a nameserver for example.com
example.com.  IN  NS    ns.somewhere.example. ; ns.somewhere.example is a backup nameserver for example.com
example.com.  IN  MX    10 mail.example.com.  ; mail.example.com is the mailserver for example.com
@             IN  MX    20 mail2.example.com. ; equivalent to above line, "@" represents zone origin
@             IN  MX    50 mail3              ; equivalent to above line, but using a relative host name
example.com.  IN  A     192.0.2.1             ; IPv4 address for example.com
              IN  AAAA  2001:db8:10::1        ; IPv6 address for example.com
ns            IN  A     192.0.2.2             ; IPv4 address for ns.example.com
              IN  AAAA  2001:db8:10::2        ; IPv6 address for ns.example.com
www           IN  CNAME example.com.          ; www.example.com is an alias for example.com
wwwtest       IN  CNAME www                   ; wwwtest.example.com is another alias for www.example.com
mail          IN  A     192.0.2.3             ; IPv4 address for mail.example.com
mail2         IN  A     192.0.2.4             ; IPv4 address for mail2.example.com
mail3         IN  A     192.0.2.5             ; IPv4 address for mail3.example.com`;

        const result = parseDnsRecords(content);

        expect(result.NS).toHaveLength(2);
        expect(result.NS[0].name).toBe('example.com');
        expect(result.NS[0].value).toBe('ns');
        expect(result.NS[1].name).toBe('example.com');
        expect(result.NS[1].value).toBe('ns.somewhere.example');

        expect(result.MX).toHaveLength(3);
        expect(result.MX[0].name).toBe('example.com');
        expect(result.MX[0].priority).toBe(10);
        expect(result.MX[0].value).toBe('mail.example.com');
        expect(result.MX[1].name).toBe('');
        expect(result.MX[1].priority).toBe(20);
        expect(result.MX[1].value).toBe('mail2.example.com');
        expect(result.MX[2].name).toBe('');
        expect(result.MX[2].priority).toBe(50);
        expect(result.MX[2].value).toBe('mail3');

        expect(result.A).toHaveLength(5);
        expect(result.A[0].name).toBe('example.com');
        expect(result.A[0].value).toBe('192.0.2.1');
        expect(result.A[1].name).toBe('ns');
        expect(result.A[1].value).toBe('192.0.2.2');
        expect(result.A[2].name).toBe('mail');
        expect(result.A[2].value).toBe('192.0.2.3');
        expect(result.A[3].name).toBe('mail2');
        expect(result.A[3].value).toBe('192.0.2.4');
        expect(result.A[4].name).toBe('mail3');
        expect(result.A[4].value).toBe('192.0.2.5');

        expect(result.AAAA).toHaveLength(2);
        expect(result.AAAA[0].name).toBe('example.com');
        expect(result.AAAA[0].value).toBe('2001:db8:10::1');
        expect(result.AAAA[1].name).toBe('ns');
        expect(result.AAAA[1].value).toBe('2001:db8:10::2');

        expect(result.CNAME).toHaveLength(2);
        expect(result.CNAME[0].name).toBe('www');
        expect(result.CNAME[0].value).toBe('example.com');
        expect(result.CNAME[1].name).toBe('wwwtest');
        expect(result.CNAME[1].value).toBe('www');
    });

    it('should parse localhost zone file', () => {
        const content = `$ORIGIN localhost.
@  86400  IN  SOA   @  root (
                  1999010100 ; serial
                       10800 ; refresh (3 hours)
                         900 ; retry (15 minutes)
                      604800 ; expire (1 week)
                       86400 ; minimum (1 day)
                    )
@  86400  IN  NS    @
@  86400  IN  A     127.0.0.1
@  86400  IN  AAAA  ::1`;

        const result = parseDnsRecords(content);

        expect(result.NS).toHaveLength(1);
        expect(result.NS[0].name).toBe('');
        expect(result.NS[0].value).toBe('@');
        expect(result.NS[0].ttl).toBe(86400);

        expect(result.A).toHaveLength(1);
        expect(result.A[0].name).toBe('');
        expect(result.A[0].value).toBe('127.0.0.1');
        expect(result.A[0].ttl).toBe(86400);

        expect(result.AAAA).toHaveLength(1);
        expect(result.AAAA[0].name).toBe('');
        expect(result.AAAA[0].value).toBe('::1');
        expect(result.AAAA[0].ttl).toBe(86400);
    });

    it('should parse complex zone file with multiple record types and comments', () => {
        const content = `; Exported (y-m-d hh:mm:ss): 2019-01-10 13:05:04
;
; This file is intended for use for informational and archival
; purposes ONLY and MUST be edited before use on a production
; DNS server.
;
; In particular, you must update the SOA record with the correct
; authoritative name server and contact e-mail address information,
; and add the correct NS records for the name servers which will
; be authoritative for this domain.
;
; For further information, please consult the BIND documentation
; located on the following website:
;
; http://www.isc.org/
;
; And RFC 1035:
;
; http://www.ietf.org/rfc/rfc1035.txt
;
; Please note that we do NOT offer technical support for any use
; of this zone data, the BIND name server, or any other third-
; party DNS software.
;
; Use at your own risk.
; SOA Record
example.com.        3600     IN     SOA ns41.domaincontrol.com. dns.net. (
                    2018122702
                    28800
                    7200
                    604800
                    3600
                    ) 
; A Records
@   600  IN     A   192.0.2.249
blog    10800    IN     A   192.0.2.255
dev 1800     IN     A   192.0.2.254
dev01   1800     IN     A   192.0.2.253
dev02   1800     IN     A   192.0.2.252
dev03   1800     IN     A   192.0.2.251
dev04   1800     IN     A   192.0.2.250
; CNAME Records
abc123b432dc7785b7ef31f04f25c3e71    1800     IN     CNAME   verify.bing.com.
akamai  600  IN     CNAME   www.example.com.edgekey.net.
email   3600     IN     CNAME   email.secureserver.net.
; MX Records
@   604800   IN     MX  10  amlxe.l.google.com.
@   604800   IN     MX  10  aplxe.l.google.com.
; TXT Records
@   3600     IN     TXT "google-site-verification=3J82-80dbMyCo5Q5C1G11JszeOnZPGCSYlHcPcXg"
@   3600     IN     TXT "google-site-verification=eS_QPYLE_W4nduSrlN-cddxG7ZqOnB743xsbX918"`;

        const result = parseDnsRecords(content);

        expect(result.A).toHaveLength(7);
        expect(result.A[0].name).toBe('');
        expect(result.A[0].value).toBe('192.0.2.249');
        expect(result.A[0].ttl).toBe(600);
        expect(result.A[1].name).toBe('blog');
        expect(result.A[1].value).toBe('192.0.2.255');
        expect(result.A[1].ttl).toBe(10800);

        expect(result.CNAME).toHaveLength(3);
        expect(result.CNAME[0].name).toBe('abc123b432dc7785b7ef31f04f25c3e71');
        expect(result.CNAME[0].value).toBe('verify.bing.com');
        expect(result.CNAME[0].ttl).toBe(1800);
        expect(result.CNAME[1].name).toBe('akamai');
        expect(result.CNAME[1].value).toBe('www.example.com.edgekey.net');
        expect(result.CNAME[1].ttl).toBe(600);

        expect(result.MX).toHaveLength(2);
        expect(result.MX[0].name).toBe('');
        expect(result.MX[0].value).toBe('amlxe.l.google.com');
        expect(result.MX[0].priority).toBe(10);
        expect(result.MX[0].ttl).toBe(604800);
        expect(result.MX[1].name).toBe('');
        expect(result.MX[1].value).toBe('aplxe.l.google.com');
        expect(result.MX[1].priority).toBe(10);
        expect(result.MX[1].ttl).toBe(604800);

        expect(result.TXT).toHaveLength(2);
        expect(result.TXT[0].name).toBe('');
        expect(result.TXT[0].value).toBe(
            'google-site-verification=3J82-80dbMyCo5Q5C1G11JszeOnZPGCSYlHcPcXg'
        );
        expect(result.TXT[0].ttl).toBe(3600);
        expect(result.TXT[1].name).toBe('');
        expect(result.TXT[1].value).toBe(
            'google-site-verification=eS_QPYLE_W4nduSrlN-cddxG7ZqOnB743xsbX918'
        );
        expect(result.TXT[1].ttl).toBe(3600);
    });

    it('should parse zone file with origin prefix', () => {
        const content = `$ORIGIN example.com.
example.com.	     3600     IN     SOA ns41.domaincontrol.com. dns.net. (
                    2018122702
                    28800
                    7200
                    604800
                    3600
		     )
					
; A Records
@   600  IN     A   192.0.2.249
blog    10800    IN     A   192.0.2.255
dev 1800     IN     A   192.0.2.254
dev01   1800     IN     A   192.0.2.253
dev02   1800     IN     A   192.0.2.252
dev03   1800     IN     A   192.0.2.251
dev04   1800     IN     A   192.0.2.250
abc123b432dc7785b7ef31f04f25c3e71    1800     IN     CNAME   verify.bing.com.
; CNAME Records
akamai  600  IN     CNAME   www.example.edgekey.net.
email   3600     IN     CNAME   email.secureserver.net.
; MX Records
@   604800   IN     MX  10  amlxe.l.google.com.
@   604800   IN     MX  10  aplxe.l.google.com.
; TXT Records
@   3600     IN     TXT "google-site-verification=3J82-80dbMyCo5Q5C1GM8os1VYVEOnZPGCSYlHcPcXg"
@   3600     IN     TXT "google-site-verification=eS_QPYLE_W4nduSrlN-cddxG7ZqOnB7k7uIG7qrsyu8"`;

        const result = parseDnsRecords(content);

        expect(result.A).toHaveLength(7);
        expect(result.A[0].name).toBe('');
        expect(result.A[0].value).toBe('192.0.2.249');
        expect(result.A[0].ttl).toBe(600);

        expect(result.CNAME).toHaveLength(3);
        expect(result.CNAME[0].name).toBe('abc123b432dc7785b7ef31f04f25c3e71');
        expect(result.CNAME[0].value).toBe('verify.bing.com');
        expect(result.CNAME[1].name).toBe('akamai');
        expect(result.CNAME[1].value).toBe('www.example.edgekey.net');

        expect(result.MX).toHaveLength(2);
        expect(result.MX[0].name).toBe('');
        expect(result.MX[0].priority).toBe(10);
        expect(result.MX[0].value).toBe('amlxe.l.google.com');

        expect(result.TXT).toHaveLength(2);
        expect(result.TXT[0].name).toBe('');
        expect(result.TXT[0].value).toBe(
            'google-site-verification=3J82-80dbMyCo5Q5C1GM8os1VYVEOnZPGCSYlHcPcXg'
        );
    });

    it('should parse complex zone file with multiple servers', () => {
        const content = `$ORIGIN example.com. 
$TTL 86400 
@	IN	SOA	dns1.example.com.	hostmaster.example.com. (
			2001062501 ; serial                     
			21600      ; refresh after 6 hours                     
			3600       ; retry after 1 hour                     
			604800     ; expire after 1 week                     
			86400 )    ; minimum TTL of 1 day  
		     
		           
	IN	NS	dns1.example.com.       
	IN	NS	dns2.example.com.        
	
	
	IN	MX	10	mail.example.com.       
	IN	MX	20	mail2.example.com.        

	
dns1	IN	A	10.0.1.1
dns2	IN	A	10.0.1.2	

			       
server1	IN	A	10.0.1.5        
server2	IN	A	10.0.1.6

       
ftp	IN	A	10.0.1.3
	IN	A	10.0.1.4
	
mail	IN	CNAME	server1
mail2	IN	CNAME	server2


www	IN	CNAME	server1`;

        const result = parseDnsRecords(content);

        expect(result.NS).toHaveLength(2);
        expect(result.NS[0].name).toBe('');
        expect(result.NS[0].value).toBe('dns1.example.com');
        expect(result.NS[1].name).toBe('');
        expect(result.NS[1].value).toBe('dns2.example.com');

        expect(result.MX).toHaveLength(2);
        expect(result.MX[0].name).toBe('');
        expect(result.MX[0].priority).toBe(10);
        expect(result.MX[0].value).toBe('mail.example.com');
        expect(result.MX[1].name).toBe('');
        expect(result.MX[1].priority).toBe(20);
        expect(result.MX[1].value).toBe('mail2.example.com');

        expect(result.A).toHaveLength(6);
        expect(result.A[0].name).toBe('dns1');
        expect(result.A[0].value).toBe('10.0.1.1');
        expect(result.A[1].name).toBe('dns2');
        expect(result.A[1].value).toBe('10.0.1.2');
        expect(result.A[2].name).toBe('server1');
        expect(result.A[2].value).toBe('10.0.1.5');
        expect(result.A[3].name).toBe('server2');
        expect(result.A[3].value).toBe('10.0.1.6');
        expect(result.A[4].name).toBe('ftp');
        expect(result.A[4].value).toBe('10.0.1.3');
        expect(result.A[5].name).toBe('ftp');
        expect(result.A[5].value).toBe('10.0.1.4');

        expect(result.CNAME).toHaveLength(3);
        expect(result.CNAME[0].name).toBe('mail');
        expect(result.CNAME[0].value).toBe('server1');
        expect(result.CNAME[1].name).toBe('mail2');
        expect(result.CNAME[1].value).toBe('server2');
        expect(result.CNAME[2].name).toBe('www');
        expect(result.CNAME[2].value).toBe('server1');
    });

    it('should parse reverse zone file with PTR records', () => {
        const content = `;; reverse zone file for 127.0.0.1 and ::1
$TTL 1814400 ; 3 weeks
@  1814400  IN  SOA     localhost. root.localhost.  (
                      1999010100 ; serial
                           10800 ; refresh (3 hours)
                             900 ; retry (15 minutes)
                          604800 ; expire (1 week)
                           86400 ; minimum (1 day)
                        )
@  1814400  IN  NS      localhost.
1  1814400  IN  PTR     localhost.`;

        const result = parseDnsRecords(content);

        expect(result.NS).toHaveLength(1);
        expect(result.NS[0].name).toBe('');
        expect(result.NS[0].value).toBe('localhost');
        expect(result.NS[0].ttl).toBe(1814400);

        expect(result.PTR).toHaveLength(1);
        expect(result.PTR[0].name).toBe('1');
        expect(result.PTR[0].value).toBe('localhost');
        expect(result.PTR[0].ttl).toBe(1814400);
    });

    it('should handle empty content', () => {
        const result = parseDnsRecords('');
        expect(result.A).toHaveLength(0);
        expect(result.AAAA).toHaveLength(0);
        expect(result.CNAME).toHaveLength(0);
        expect(result.MX).toHaveLength(0);
        expect(result.NS).toHaveLength(0);
        expect(result.TXT).toHaveLength(0);
        expect(result.PTR).toHaveLength(0);
    });

    it('should handle invalid content', () => {
        const result = parseDnsRecords('This is not a valid zone file');
        expect(result.A).toHaveLength(0);
        expect(result.AAAA).toHaveLength(0);
        expect(result.CNAME).toHaveLength(0);
        expect(result.MX).toHaveLength(0);
        expect(result.NS).toHaveLength(0);
        expect(result.TXT).toHaveLength(0);
        expect(result.PTR).toHaveLength(0);
    });

    it('should handle content with only comments', () => {
        const result = parseDnsRecords(`; This is a comment
; This is another comment
; And one more comment`);
        expect(result.A).toHaveLength(0);
        expect(result.AAAA).toHaveLength(0);
        expect(result.CNAME).toHaveLength(0);
        expect(result.MX).toHaveLength(0);
        expect(result.NS).toHaveLength(0);
        expect(result.TXT).toHaveLength(0);
        expect(result.PTR).toHaveLength(0);
    });
});
