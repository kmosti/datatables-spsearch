<#Author:
kristian.husevik.mosti@atea.no

Purpose:
Add properties to web objects in SharePoint Online using CSOM that can later be retrieved
in both regular search and most importantly by querying the Search REST API

Credit goes to:
https://platinumdogs.me/2015/02/06/set-a-propertybag-property-as-indexed-queryable-via-search-using-csom-powershell/
for figuring out how to add a property to indexed properties in SPO
#>

Add-Type -Path "C:\Program Files\Common Files\microsoft shared\Web Server Extensions\16\ISAPI\Microsoft.SharePoint.Client.dll"
Add-Type -Path "C:\Program Files\Common Files\microsoft shared\Web Server Extensions\16\ISAPI\Microsoft.SharePoint.Client.Runtime.dll"

$AdminAccount = "user@domain.no"
$pwfile = "C:\PW.txt"
$siteurl = "https://tennant.sharepoint.com/teams/site"

if (!(Test-Path $pwfile)) {
    Write-Host -ForegroundColor Yellow "pw not found, please input password"
    Read-Host "Enter Password" -AsSecureString | ConvertFrom-SecureString | Out-File $pwfile
}

$AdminPass = Get-Content $pwfile | ConvertTo-SecureString -ErrorAction Stop
$credentials = New-Object -TypeName System.Management.Automation.PSCredential -argumentlist $AdminAccount, $AdminPass

$spoCtx = New-Object Microsoft.SharePoint.Client.ClientContext($siteurl)
$spoCreds = New-Object Microsoft.SharePoint.Client.SharePointOnlineCredentials($AdminAccount, $AdminPass)
$spoCtx.Credentials = $spoCreds

function Set-PropertyBag {
    param (
        [string]$PropertyName,
        [string]$PropertyValue = $null,
        [bool]$Indexable = $false,
        [Microsoft.SharePoint.Client.Web]$Web,
        [Microsoft.SharePoint.Client.ClientContext]$ClientContext
    )
    process {
            $indexedPropertyBagKey = "vti_indexedpropertykeys"
            if($Indexable) {
                Write-Host -f Yellow "Adding $PropertyName as indexed column"
                $ClientContext.Load($Web.AllProperties)
                $ClientContext.ExecuteQuery()
                $oldIndexedProperties = $Web.AllProperties.FieldValues[$indexedPropertyBagKey]
                Write-Host -f Yellow "old indexed keys = $($Web.AllProperties[$indexedPropertyBagKey])"
                if($oldIndexedProperties -ne $null) {
                    $oldIndexedProperties = $oldIndexedProperties.ToString()
                } else { 
                    $oldIndexedProperties = "" 
                }

                $propertyNameBytes = [System.Text.Encoding]::Unicode.GetBytes($PropertyName)
                $encodedPropertyName = [Convert]::ToBase64String($propertyNameBytes)
        
                if($oldIndexedProperties -notlike "*$encodedPropertyName*") {
                    $Web.AllProperties[$indexedPropertyBagKey] = "$oldIndexedProperties$encodedPropertyName|"
                }
                Write-Host -f Yellow "Current propertykeys = $($Web.AllProperties[$indexedPropertyBagKey])"
            }

            $Web.AllProperties[$PropertyName] = $PropertyValue
            $Web.Update()
            
            $ClientContext.Load($Web)
            $ClientContext.Load($Web.AllProperties)
            $ClientContext.ExecuteQuery()
    }
}

#Example:
Set-PropertyBag -PropertyName ProjectShortName -PropertyValue "Proj-0001" -Indexable $true -Web $spoCtx.Site.RootWeb -ClientContext $spoCtx
Set-PropertyBag -PropertyName ProjectCategory -PropertyValue "Enterprise Search" -Indexable $true -Web $spoCtx.Site.RootWeb -ClientContext $spoCtx

<#Next steps:
1. Map crawled property to managed property
2. Choose refinablestringXX if you wish to use the field as a search refiner, otherwise create a new managed property and make it retrievable as a minimum
3. Test that you get a value by querying the search rest api. Simplest to do by using this tool: https://sp2013searchtool.codeplex.com/
4. Build your datatables script with queries against the rest api
#>