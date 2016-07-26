function search(webUrl,queryText,rowLimit,startRow,allResults)
{
    var allResults = allResults || [];
    var url = webUrl
			+ "/_api/search/query?querytext='"
			+ queryText
			+ "'&rowlimit="
			+ rowLimit
			+ "'&startrow="
			+ startRow
			+ "&trimduplicates=false"
			+ "&sortlist='LastModifiedTime:descending'"
			//Be sure to include all properties you wish to display
			+ "&selectproperties='Title,Description,LastModifiedTime,path,AAAProjectShortName,AAAProjectCategory,AAAProjectManager,AAAProjectClient,AAAProjectNumber'";
    return $.ajax({
			url: url,
			type: "GET",
			dataType: "json",
			headers: {
				Accept: "application/json;odata=verbose"
			}
			}).then(function(data) {
						var relevantResults = data.d.query.PrimaryQueryResult.RelevantResults;
						allResults = allResults.concat(relevantResults.Table.Rows);
						if (relevantResults.TotalRows > startRow + relevantResults.RowCount) {
						  return search(webUrl,queryText,rowLimit,startRow+relevantResults.RowCount,allResults);
					    }
						//console.dir(allResults);
						return allResults;
					   
				});
}

function allRecentDocuments(results) {
		$(results).each(function() {
			$(this.results).each(function() {
				//create the result object to be parsed into datatables table
				//To debug, try using https://sp2013searchtool.codeplex.com/
				//To check the output, the Chrome App "Advanced Rest Client" is also a great tool
				var itemObject = {};
				itemObject.path = this.Cells.results[5].Value;
				itemObject.LastModifiedTime = this.Cells.results[4].Value || "";
				itemObject.Title = this.Cells.results[2].Value;
				itemObject.ProjectShortName = this.Cells.results[6].Value || "";
				itemObject.ProjectCategory = this.Cells.results[7].Value || "";
				itemObject.ProjectManager = this.Cells.results[8].Value || "";
				itemObject.ProjectClient = this.Cells.results[9].Value || "";
				itemObject.ProjectNumber = this.Cells.results[10].Value || "";
				
				var trHtml =    "<tr>"
								+ "<td><a href='"
								+ itemObject.path
								+ "'>"
								+ itemObject.Title
								+ "</a></td>"
								+ "<td>"
								+ itemObject.ProjectShortName
								+ "</td>"
								+ "<td>"
								+ itemObject.ProjectCategory
								+ "</td>"
								+ "<td>"
								+ itemObject.ProjectManager
								+ "</td>"
								+ "<td>"
								+ itemObject.ProjectClient
								+ "</td>"
								+ "<td>"
								+ itemObject.ProjectNumber
								+ "</td>"
								+ "<td>"
								+ moment(itemObject.LastModifiedTime).format("DD/MM/YY HH:mm")
								+ "</td>"
								+ "<td>"
								+ moment(itemObject.LastModifiedTime).format("YYYYMMDDHHmm")
								+ "</td></tr>";

				$("#alldocs").append(trHtml);

			})
		});
		
		//render datatables
        $('.allloader').hide();
        $('#tablealldocs').show().DataTable({
        	columnDefs: [
        		{
        			targets: [ 7 ],
        			visible: false,
        			bSearchable: false
        		},
        		{
        			targets: 6,
        			iDataSort: 7,
        			bSearchable: false
        		}
        	]
        });
}
