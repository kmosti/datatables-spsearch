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
			+ "&selectproperties='Title,Description,LastModifiedTime,path,AAAProjectShortName,AAAProjectCategory,AAAProjectOwner,AAAProjectTeam,AAAProjectStartDate'";
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
						console.dir(allResults);
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
				itemObject.path = this.Cells.results[2].Value;
				itemObject.LastModifiedTime = this.Cells.results[4].Value || "";
				itemObject.Title = this.Cells.results[5].Value.split(" - ")[5];
				itemObject.ProjectShortName = this.Cells.results[6].Value || "";
				itemObject.ProjectCategory = this.Cells.results[7].Value || "";
				itemObject.ProjectOwner = this.Cells.results[8].Value || "";
				itemObject.ProjectTeam = this.Cells.results[9].Value || "";
				itemObject.ProjectStartDate = this.Cells.results[10].Value || "";
				
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
								+ itemObject.ProjectOwner
								+ "</td>"
								+ "<td>"
								+ itemObject.ProjectTeam
								+ "</td>"
								+ "<td>"
								+ itemObject.ProjectStartDate
								+ "</td>"
								+ "<td></tr>";

				$("#alldocs").append(trHtml);

			})
		});
		
		//render datatables
        $('.allloader').hide();
        $('#tablealldocs').show().DataTable({
            /*"order": [[ 0, "desc" ]],
            "columns": [
            { "title": "Title"},
			{ "title": "Bilnummer"},
			{ "title": "Selger"},
			{ "title": "Kunde"},
			{ "title": "NyBrukt"},
			{ "title": "NyBrukt"},
            {
                "title": "Sist endret",
                "iDataSort": 7,
				"bSearchable": false
            },
            {
				"title": "sortdate",
				"bSearchable": false
			},
            ]*/
        });
}